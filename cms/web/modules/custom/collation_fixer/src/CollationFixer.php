<?php

declare(strict_types = 1);

namespace Drupal\collation_fixer;

use Drupal\Core\Database\Connection;
use Drupal\Core\Database\StatementInterface;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\Sql\SqlEntityStorageInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;

/**
 * Core class for fixing collations.
 */
final class CollationFixer {

  /**
   * Constructor.
   */
  public function __construct(
    private readonly Connection $connection,
    private readonly ModuleHandlerInterface $moduleHandler,
    private readonly EntityTypeManagerInterface $entityTypeManager,
    private readonly EntityFieldManagerInterface $fieldManager,
  ) {}

  /**
   * Check table collations.
   *
   * @param string $table
   *   Name of a table to check for collation correctness.
   *   Defaults to all tables if not set.
   *
   * @return TableCollation[]
   *   A list of tables with wrong collation or charset.
   */
  public function checkCollation(?string $table = NULL): array {
    $schema = $this->getSchema($table);

    $databaseName = &drupal_static(__FUNCTION__);
    if (empty($databaseName)) {
      $connection_options = $this->connection->getConnectionOptions();
      $databaseName = $connection_options['database'];
    }

    $fallbackCharset = $this->getFallbackCharset();
    $fallbackCollation = $this->getFallbackCollation();

    $wrongCollations = [];

    foreach ($schema as $tableName) {
      $schemaCharset = $fallbackCharset;
      $charsetResult = $this->connection->query(
        'SELECT CCSA.character_set_name FROM information_schema.`TABLES` T,information_schema.`COLLATION_CHARACTER_SET_APPLICABILITY` CCSA WHERE CCSA.collation_name = T.table_collation AND T.table_schema = :table_schema AND T.table_name = :table_name',
        [':table_schema' => $databaseName, ':table_name' => $tableName]
      );
      $databaseCharset = ($charsetResult instanceof StatementInterface) ? $charsetResult->fetchField() : $fallbackCharset;

      $schemaCollation = $fallbackCollation;
      $collationResult = $this->connection->query(
        'SELECT TABLE_COLLATION FROM information_schema.tables WHERE TABLE_SCHEMA = :table_schema AND TABLE_NAME = :table_name',
        [':table_schema' => $databaseName, ':table_name' => $tableName]
      );
      $databaseCollation = ($collationResult instanceof StatementInterface) ? $collationResult->fetchField() : $fallbackCollation;

      if (($schemaCharset != $databaseCharset) || ($schemaCollation != $databaseCollation)) {
        $wrongCollations[] = new TableCollation($tableName, $databaseCollation, $databaseCharset, $schemaCollation, $schemaCharset);
      }
    }

    return $wrongCollations;
  }

  /**
   * Fix tables collations.
   *
   * @param string $table
   *   Name of a table to fix collation on. Defaults to all tables.
   *
   * @return bool
   *   TRUE if collations where changed successfully.
   */
  public function fixCollation(?string $table = NULL) {
    $wrongCollations = $this->checkCollation($table);

    $status = TRUE;

    foreach ($wrongCollations as $tableCollation) {

      // Alter character set and collation of table definition.
      $query = $this->connection->query(
        // Placeholders are intentionally not used there. It does not seem as
        // if is it supported.
        "ALTER TABLE {$tableCollation->table} CHARACTER SET {$tableCollation->expectedCharset} COLLATE {$tableCollation->expectedCollation}"
      );
      if ($query instanceof StatementInterface) {
        $result = $query->execute();
        $status = $status && $result;
      }

      // Alter character set and collation of table data.
      $query = $this->connection->query(
        // Placeholders are intentionally not used there. It does not seem as
        // if is it supported.
        "ALTER TABLE {$tableCollation->table} CONVERT TO CHARACTER SET {$tableCollation->expectedCharset} COLLATE {$tableCollation->expectedCollation}"
      );
      if ($query instanceof StatementInterface) {
        $result = $query->execute();
        $status = $status && $result;
      }
    }

    return $status;
  }

  /**
   * Returns all available schemas ie. table names.
   *
   * @param ?string $table
   *   A specific table name to check.
   *
   * @return string[]
   *   An array of table names.
   */
  private function getSchema(?string $table = NULL): array {
    $schemas = array_map(function (string $module) {
      if ($this->moduleHandler->loadInclude($module, 'install')) {
        return $this->moduleHandler->invoke($module, 'schema') ?? [];
      }
      return [];
    }, array_keys($this->moduleHandler->getModuleList()));
    $moduleSchemas = array_merge(...$schemas);

    $entitySchemas = [];
    foreach ($this->entityTypeManager->getDefinitions() as $entityType) {
      // Only list content entity types using SQL storage.
      $entityStorage = $this->entityTypeManager->getStorage($entityType->id());
      if ($entityStorage instanceof SqlEntityStorageInterface) {
        foreach ($this->fieldManager->getFieldStorageDefinitions($entityType->id()) as $field) {
          $entitySchemas = array_merge($entitySchemas, $entityStorage->getTableMapping()->getAllFieldTableNames($field->getName()));
        }
      }
    }
    $tableNames = array_unique(array_merge(array_keys($moduleSchemas), $entitySchemas));

    if (!empty($table)) {
      return array_filter($tableNames, function ($table_name) use ($table) {
        return $table == $table_name;
      });
    }
    return $tableNames;
  }

  /**
   * Get the default charset to use if nothing else is specified.
   */
  private function getFallbackCharset(): string {
    $connectionOptions = $this->connection->getConnectionOptions();
    if (isset($connectionOptions['charset'])) {
      $fallbackCharset = $connectionOptions['charset'];
    }
    else {
      // There does not seem to be a default charset used for Drupal 10.
      // utf8mb4 was the charset suggested when multibyte UTF-8 support was
      // added to Drupal 7. In lack of other sources we use this as well here.
      // https://www.drupal.org/node/2754539
      $fallbackCharset = 'utf8mb4';
    }

    return $fallbackCharset;
  }

  /**
   * Get the default collation to use if nothing else is specified.
   */
  private function getFallbackCollation(): string {
    $connectionOptions = $this->connection->getConnectionOptions();
    if (isset($connectionOptions['collation'])) {
      $fallbackCollation = $connectionOptions['collation'];
    }
    else {
      // There does not seem to be a default collation used for Drupal 10.
      // utf8mb4_unicode_ci was the collation suggested when multibyte UTF-8
      // support was added to Drupal 7. In lack of other sources we use this as
      // well here.
      // https://www.drupal.org/node/2754539
      $fallbackCollation = 'utf8mb4_unicode_ci';
    }

    return $fallbackCollation;
  }

}
