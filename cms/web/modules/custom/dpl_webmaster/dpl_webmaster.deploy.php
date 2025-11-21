<?php

use Drupal\Core\DrupalKernelInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\drupal_typed\DrupalTyped;
use Drush\Commands\core\CacheRebuildCommands;
use Drush\Drush;

/**
 * Remove any locally installed asset_injector module.
 *
 * Originally we tried doing this in the update hook, but that made drush deploy
 * fail as the running drush was still using the old location, and the module
 * implements hook_cache_flush(). Drush deploy doesn't do anything after running
 * deploy hooks, so we can do it here.
 *
 * This might not be necessary anymore due to other changes, but this has been
 * through so many iterations already.
 */
function dpl_webmaster_deploy_remove_locally_installed_asset_injector(): string {
  $feedback = [];
  $kernel = DrupalTyped::service(DrupalKernelInterface::class);
  $fileSystem = DrupalTyped::service(FileSystemInterface::class);

  $root = (string) $kernel->getAppRoot();

  $moduleDir = $root . '/modules/local/asset_injector';

  if (file_exists($moduleDir)) {
    $fileSystem->deleteRecursive($moduleDir);
    // Rebuild the container so it sees the module in the new location.
    $kernel->rebuildContainer();

    // We need to clear the cache in order for Drupal to fully discover the
    // module again, but doing it in this process will just fail again, so we
    // explicitly run `drush cr` as a sub-process which does work.
    // See also the `class_loader_auto_detect` setting in all.settings.php.
    $process = Drush::processManager()->drush(
      Drush::aliasManager()->getSelf(),
      CacheRebuildCommands::REBUILD,
      [],
      Drush::redispatchOptions(),
    );
    $process->mustRun($process->showRealtime());

    $feedback[] = 'Removed manually installed asset_injector';
  }

  return implode("\n", $feedback);
}
