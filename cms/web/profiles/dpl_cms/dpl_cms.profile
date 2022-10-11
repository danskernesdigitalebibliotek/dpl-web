<?php

/**
 * @file
 * Enables modules and site configuration for a standard site installation.
 */

use Drupal\user\Entity\User;

/**
 * Implements hook_updater_info_alter().
 */
function dpl_cms_updater_info_alter(&$updaters): void {
  // Extending the core updater module class.
  // We need to change the path
  // because we want to persist the modules in a volume.
  $updaters['module']['class'] = 'Drupal\\dpl_cms\\Updater\\Module';
}

/**
 * Implements hook_modules_installed().
 */
function dpl_cms_modules_installed(array $modules, bool $is_syncing): void {
  $user = User::load(1);

  // Make sure that the admin language of the admin user is set to english.
  // That will make sure that config is exported in english.
  if ($user->get('preferred_admin_langcode')->isEmpty()) {
    $user->set('preferred_admin_langcode', 'en');
    $user->save();
  }

  // Log what happened.
  if (!$user->get('preferred_admin_langcode')->isEmpty()) {
    \Drupal::logger('dpl_cms_modules')
      ->notice(
        'Admin lang for user 1 was set to: @lang',
        ['@lang' => $user->get('preferred_admin_langcode')->getValue()[0]['value']]
      );
  }
  else {
    \Drupal::logger('dpl_cms_modules')
      ->error('Failed in setting the admin lang for user 1');
  }
}
