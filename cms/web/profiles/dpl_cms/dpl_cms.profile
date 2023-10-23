<?php

/**
 * @file
 * Enables modules and site configuration for a standard site installation.
 */

use Drupal\user\Entity\User;

/**
 * Implements hook_updater_info_alter().
 *
 * @param mixed[] $updaters
 *   An associative array of information about the updater(s) being provided.
 */
function dpl_cms_updater_info_alter(array &$updaters): void {
  // Extending the core updater module class.
  // We need to change the path
  // because we want to persist the modules in a volume.
  $updaters['module']['class'] = 'Drupal\\dpl_cms\\Updater\\Module';
}

/**
 * Implements hook_modules_installed().
 *
 * @param string[] $modules
 *   An array of the modules that were installed.
 */
function dpl_cms_modules_installed(array $modules, bool $is_syncing): void {
  /** @var \Drupal\user\UserInterface $user */
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

/**
 * Implements hook_batch_alter().
 *
 * @param mixed[] $batch
 *   An associative array of batches.
 */
function dpl_cms_batch_alter(array &$batch): void {
  if (empty($batch['sets'])) {
    return;
  }

  // Since the locale cache tag is not invalidated when running
  // `drush locale-update` we need to make sure it happens ourselves
  // by injecting our own batch finished callback.
  foreach ($batch['sets'] as $key => $set) {
    if (
      array_key_exists('finished', $set)
      && $set['finished'] === 'locale_translation_batch_fetch_finished'
    ) {
      $batch['sets'][$key]['finished'] = 'dpl_cms_locale_translation_batch_fetch_finished';
    }
  }
}

/**
 * Implements callback_batch_finished().
 *
 * @param bool $success
 *   TRUE if batch successfully completed.
 * @param mixed[] $results
 *   Batch results.
 *
 * @see hook_batch_alter
 */
function dpl_cms_locale_translation_batch_fetch_finished(bool $success, array $results): void {
  if ($success && $languages = array_values($results['languages'] ?? [])) {
    _locale_refresh_translations($languages);
    \Drupal::logger('dpl_cms')->notice("New translations were imported and translation cache was cleared.");
  }
  // @todo remove this logging when we are sure that
  // the translation cache functionality works.
  else {
    \Drupal::logger('dpl_cms')->notice("No new translations were imported.");
  }

  locale_translation_batch_fetch_finished($success, $results);
}
