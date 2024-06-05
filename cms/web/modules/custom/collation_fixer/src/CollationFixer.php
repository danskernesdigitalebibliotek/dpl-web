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

    $database_name = &drupal_static(__FUNCTION__);
    if (empty($database_name)) {
      $connection_options = $this->connection->getConnectionOptions();
      $database_name = $connection_options['database'];
    }

    $fallback_charset = $this->getFallbackCharset();
    $fallback_collation = $this->getFallbackCollation();

    $wrong_collations = [];

    foreach ($schema as $table_name) {
      $schema_charset = $fallback_charset;
      $charset_result = $this->connection->query(
        'SELECT CCSA.character_set_name FROM information_schema.`TABLES` T,information_schema.`COLLATION_CHARACTER_SET_APPLICABILITY` CCSA WHERE CCSA.collation_name = T.table_collation AND T.table_schema = :table_schema AND T.table_name = :table_name',
        [':table_schema' => $database_name, ':table_name' => $table_name]
      );
      $db_charset = ($charset_result instanceof StatementInterface) ? $charset_result->fetchField() : $fallback_charset;

      $schema_collation = $fallback_collation;
      $collation_result = $this->connection->query(
        'SELECT TABLE_COLLATION FROM information_schema.tables WHERE TABLE_SCHEMA = :table_schema AND TABLE_NAME = :table_name',
        [':table_schema' => $database_name, ':table_name' => $table_name]
      );
      $db_collation = ($collation_result instanceof StatementInterface) ? $collation_result->fetchField() : $fallback_collation;

      if (($schema_charset != $db_charset) || ($schema_collation != $db_collation)) {
        $wrong_collations[] = new TableCollation($table_name, $db_collation, $db_charset, $schema_collation, $schema_charset);
      }
    }

    return $wrong_collations;
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
    $table_names = array_unique(array_merge(array_keys($moduleSchemas), $entitySchemas));

    if (!empty($table)) {
      return array_filter($table_names, function ($table_name) use ($table) {
        return $table == $table_name;
      });
    }
    return $table_names;
  }

  /**
   * Get the default charset to use if nothing else is specified.
   */
  private function getFallbackCharset(): string {
    $connection_options = $this->connection->getConnectionOptions();
    if (isset($connection_options['charset'])) {
      $fallback_charset = $connection_options['charset'];
    }
    else {
      // There does not seem to be a default charset used for Drupal 10.
      // utf8mb4 was the charset suggested when multibyte UTF-8 support was
      // added to Drupal 7. In lack of other sources we use this as well here.
      // https://www.drupal.org/node/2754539
      $fallback_charset = 'utf8mb4';
    }

    return $fallback_charset;
  }

  /**
   * Get the default collation to use if nothing else is specified.
   */
  private function getFallbackCollation(): string {
    $connection_options = $this->connection->getConnectionOptions();
    if (isset($connection_options['collation'])) {
      $fallback_collation = $connection_options['collation'];
    }
    else {
      // There does not seem to be a default collation used for Drupal 10.
      // utf8mb4_unicode_ci was the collation suggested when multibyte UTF-8
      // support was added to Drupal 7. In lack of other sources we use this as
      // well here.
      // https://www.drupal.org/node/2754539
      $fallback_collation = 'utf8mb4_unicode_ci';
    }

    return $fallback_collation;
  }

}
