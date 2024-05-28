<?php

namespace Drupal\collation_fixer\Commands;

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
   * Command description here.
   *
   * @command collation-fixer
   * @option table Name of a table to fix collation on. Defaults to all tables
   */
  public function fixTable($options = ['table' => NULL]) {
    $tables = $this->collationFixer->checkCollation($options['table']);
    $total = array_map(function (string $table) {
      return $this->collationFixer->fixCollation($table);
    }, $tables);

    if (count($total)) {
      $this->io()->success(sprintf('%s tables were processed.', count($total)));
    } else {
      $this->io()->info('No collation fixes needs to be done');
    }
  }

}
