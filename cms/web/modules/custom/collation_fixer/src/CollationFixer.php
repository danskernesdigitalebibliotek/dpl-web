<?php declare(strict_types = 1);

namespace Drupal\collation_fixer;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\ContentEntityTypeInterface;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\Sql\SqlEntityStorageInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\TestTools\Extension\SchemaInspector;

/**
 * @todo Add class description.
 */
final class CollationFixer {

  /**
   * Constructs a CollationFixer object.
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
   *   Name of a table to check for collation correctness. Defaults to all tables.
   *
   * @return array
   *   A list of tables with wrong collations.
   */
  public function checkCollation(?string $table = NULL) {
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
      $db_charset = $this->connection->query(
        'SELECT CCSA.character_set_name FROM information_schema.`TABLES` T,information_schema.`COLLATION_CHARACTER_SET_APPLICABILITY` CCSA WHERE CCSA.collation_name = T.table_collation AND T.table_schema = :table_schema AND T.table_name = :table_name',
        [':table_schema' => $database_name, ':table_name' => $table_name]
      )->fetchField();

      $schema_collation = $fallback_collation;
      $db_collation = $this->connection->query(
        'SELECT TABLE_COLLATION FROM information_schema.tables WHERE TABLE_SCHEMA = :table_schema AND TABLE_NAME = :table_name',
        [':table_schema' => $database_name, ':table_name' => $table_name]
      )->fetchField();

      if (($schema_charset != $db_charset) || ($schema_collation != $db_collation)) {
        $wrong_collations[] = $table_name;
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
  function fixCollation(?string $table = NULL) {
    $schema = $this->getSchema($table);
    if (!empty($table) && !in_array($table, $schema)) {
      return FALSE;
    }

    $fallback_charset = $this->getFallbackCharset();
    $fallback_collation = $this->getFallbackCollation();

    $status = TRUE;

    foreach ($schema as $table_name) {
      $charset = $fallback_charset;
      $collation = $fallback_collation;

      // Alter character set and collation of table definition.
      if ($result = $this->connection->query(
        "ALTER TABLE {$table_name} CHARACTER SET {$charset} COLLATE {$collation}"
      )->execute()) {
        $status = $status && $result;
      };

      // Alter character set and collation of table data.
      if ($result = $this->connection->query(
        "ALTER TABLE {$table_name} CONVERT TO CHARACTER SET {$charset} COLLATE {$collation}"
      )->execute()) {
        $status = $status && $result;
      };
    }

    return $status;
  }

  private function getSchema(?string $table = NULL) {
    $schemas = array_map(function(string $module) {
      if ($this->moduleHandler->loadInclude($module, 'install')) {
        return $this->moduleHandler->invoke($module, 'schema') ?? [];
      } else {
        return [];
      }
    }, array_keys($this->moduleHandler->getModuleList()));
    $moduleSchemas = array_merge(...$schemas);

    $entitySchemas = [];
    foreach ($this->entityTypeManager->getDefinitions() as $entityType) {
      // Only list content entity types using SQL storage.
      if ($entityType instanceof ContentEntityTypeInterface && in_array(SqlEntityStorageInterface::class, class_implements($entityType->getStorageClass()))) {
        $storage = $this->entityTypeManager->getStorage($entityType->id());

        foreach ($this->fieldManager->getFieldStorageDefinitions($entityType->id()) as $field) {
          $entitySchemas = array_merge($entitySchemas, $storage->getTableMapping()->getAllFieldTableNames($field->getName()));
        }
      }
    }
    $table_names = array_unique(array_merge(array_keys($moduleSchemas), $entitySchemas));

    if (!empty($table)) {
      return array_filter($table_names, function($table_name) use ($table) { return $table == $table_name; });
    } else {
      return $table_names;
    }
  }

  private function getFallbackCharset() {
    $connection_options = $this->connection->getConnectionOptions();
    if (isset($connection_options['charset'])) {
      $fallback_charset = $connection_options['charset'];
    }
    else {
      $fallback_charset = 'utf8mb4';
    }

    return $fallback_charset;
  }

  private function getFallbackCollation() {
    $connection_options = $this->connection->getConnectionOptions();
    if (isset($connection_options['collation'])) {
      $fallback_collation = $connection_options['collation'];
    }
    else {
      $fallback_collation = 'utf8mb4_general_ci';
    }

    return $fallback_collation;
  }


}
