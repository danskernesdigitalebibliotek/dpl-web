<?php

/**
 * @file
 * Enables modules and site configuration for a standard site installation.
 */

/**
 * Implements hook_updater_info_alter().
 */
function dpl_cms_updater_info_alter(&$updaters): void {
  // Extending the core updater module class.
  // We need to change the path
  // because we want to persist the modules in a volume.
  $updaters['module']['class'] = 'Drupal\\dpl_cms\\Updater\\Module';
}
