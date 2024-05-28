<?php

namespace Drupal\collation_fixer\Commands;

use Drupal\collation_fixer\CollationFixer;
use Drush\Commands\DrushCommands;

/**
 * Drush commands for fixing collations from the command line.
 */
final class CollationFixerCommands extends DrushCommands {

  /**
   * Constructor.
   */
  public function __construct(
    private CollationFixer $collationFixer,
  ) {
    parent::__construct();
  }

  /**
   * Fix collation for one or more tables.
   *
   * @command collation-fixer
   * @option table Name of a table to fix collation on. Defaults to all tables.
   */
  public function fixTable($options = ['table' => NULL]) {
    $tables = $this->collationFixer->checkCollation($options['table']);
    $total = array_map(function (string $table) {
      return $this->collationFixer->fixCollation($table);
    }, $tables);

    if (count($total)) {
      $this->io()->success(sprintf('%s tables were processed.', count($total)));
    }
    else {
      $this->io()->info('No collation fixes needs to be done');
    }
  }

}
