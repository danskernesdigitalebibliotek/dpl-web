<?php

namespace Drupal\collation_fixer\Drush\Commands;

use Consolidation\OutputFormatters\StructuredData\RowsOfFields;
use Drupal\collation_fixer\CollationFixer;
use Drupal\Core\Utility\Token;
use Drush\Attributes as CLI;
use Drush\Commands\DrushCommands;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class CollationFixerCommands extends DrushCommands
{

  /**
   * Constructs a CollationFixerCommands object.
   */
  public function __construct(
    private CollationFixer $collationFixer,
  ) {
    parent::__construct();
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('collation_fixer.collation_fixer'),
    );
  }

  /**
   * Command description here.
   */
  #[CLI\Command(name: 'collation-fixer')]
  #[CLI\Option(name: 'table', description: 'Name of a table to fix collation on. Defaults to all tables')]
  public function commandName($options = ['table' => NULL]) {
    $tables = $this->collationFixer->checkCollation($options['table']);
    $total = array_map(function (string $table) {
      return $this->collationFixer->fixCollation($table);
    }, $tables);

    if ($total > 0) {
      $this->logger->log('@current tables  were processed.', ['@current' => count($total)]);
    } else {
      $this->logger->log('No collation fixes needs to be done');
    }
  }

}
