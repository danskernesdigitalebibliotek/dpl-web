<?php

declare(strict_types=1);

namespace Drupal\dpl_login\Hook;

use Drupal\Core\Hook\Attribute\Hook;

/**
 * Collation fixer hooks for dpl_login module.
 */
class CollationFixerHooks {

  /**
   * Keep the collation fixer from reverting the binary {authmap} columns.
   *
   * @param array<string, \Drupal\collation_fixer\TableCollation> $expected_collations
   *   Expected collations, keyed by table name.
   */
  #[Hook('collation_fixer_expected_collations_alter')]
  public function skipAuthmap(array &$expected_collations): void {
    // externalauth_update_8104() makes {authmap} authname and provider binary
    // per column, to stop our case- and accent-insensitive connection
    // collation from matching byte-distinct authnames (SA-CONTRIB-2026-098).
    // The fixer only knows table-level collation, and fixes with ALTER TABLE
    // CONVERT TO, which rewrites every column - silently reverting the
    // security fix. Trade-off: {authmap} is no longer collation-checked at
    // all.
    unset($expected_collations['authmap']);
  }

}
