<?php

declare(strict_types=1);

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
   * @return CollationMismatch[]
   *   A list of tables with wrong collation or charset.
   */
  public function checkCollation(?string $table = NULL): array {
    $tableNames = $this->getTableNames($table);

    $connectionOptions = $this->connection->getConnectionOptions();
    $connectionCharset = $connectionOptions['charset'];
    $connectionCollation = $connectionOptions['collation'];

    /** @var array<string, TableCollation> $expectedCollations */
    $expectedCollations = [];
    // If we have a collation and charset for the connection then these are
    // expected values for all tables.
    if (!empty($connectionCharset) || !empty($connectionCollation)) {
      if (empty($connectionCharset) || empty($connectionCollation)) {
        throw new \RuntimeException("Both connection charset and collation must be set for the connection.");
      }
      $expectedCollations = array_map(function (string $tableName) use ($connectionCharset, $connectionCollation): TableCollation {
        return new TableCollation($tableName, $connectionCollation, $connectionCharset);
      }, array_combine($tableNames, $tableNames));
    }

    // Allow third parties to update the expected collations. This allows them
    // to add expectations for specific tables or update expectations set but
    // others.
    $this->moduleHandler->alter('collation_fixer_expected_collations', $expectedCollations);

    $wrongCollations = array_map(function (TableCollation $expectedCollation) : ?CollationMismatch {
      $actualCollation = $this->getCollation($expectedCollation->table);
      if ($actualCollation->charset !== $expectedCollation->charset || $actualCollation->collation !== $expectedCollation->collation) {
        return new CollationMismatch($expectedCollation, $actualCollation);
      }
      return NULL;
    }, $expectedCollations);

    return array_filter($wrongCollations);
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

    foreach ($wrongCollations as $mismatch) {

      // Alter character set and collation of table definition.
      $query = $this->connection->query(
        // Placeholders are intentionally not used there. It does not seem as
        // if is it supported.
        "ALTER TABLE {$mismatch->actual->table} CHARACTER SET {$mismatch->expected->charset} COLLATE {$mismatch->expected->collation}"
      );
      if ($query instanceof StatementInterface) {
        $result = $query->execute();
        $status = $status && $result;
      }

      // Alter character set and collation of table data.
      $query = $this->connection->query(
        // Placeholders are intentionally not used there. It does not seem as
        // if is it supported.
        "ALTER TABLE {$mismatch->actual->table} CONVERT TO CHARACTER SET {$mismatch->expected->charset} COLLATE {$mismatch->expected->collation}"
      );
      if ($query instanceof StatementInterface) {
        $result = $query->execute();
        $status = $status && $result;
      }
    }

    return $status;
  }

  /**
   * Returns all available table names.
   *
   * @param ?string $table
   *   A specific table name to check.
   *
   * @return string[]
   *   An array of table names.
   */
  private function getTableNames(?string $table = NULL): array {
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
   * Determine the collation for a specific table.
   */
  private function getCollation(string $tableName): TableCollation {
    $connection_options = $this->connection->getConnectionOptions();
    $databaseName = $connection_options['database'];
    $charsetResult = $this->connection->query(
      'SELECT CCSA.character_set_name FROM information_schema.`TABLES` T,information_schema.`COLLATION_CHARACTER_SET_APPLICABILITY` CCSA WHERE CCSA.collation_name = T.table_collation AND T.table_schema = :table_schema AND T.table_name = :table_name',
      [':table_schema' => $databaseName, ':table_name' => $tableName]
    );
    $collationResult = $this->connection->query(
      'SELECT TABLE_COLLATION FROM information_schema.tables WHERE TABLE_SCHEMA = :table_schema AND TABLE_NAME = :table_name',
      [':table_schema' => $databaseName, ':table_name' => $tableName]
    );
    if (!$charsetResult instanceof StatementInterface || !$collationResult instanceof StatementInterface) {
      throw new \RuntimeException("Unable to determine the character set for table {$tableName}");
    }
    return new TableCollation($tableName, $collationResult->fetchField(), $charsetResult->fetchField());
  }

}
