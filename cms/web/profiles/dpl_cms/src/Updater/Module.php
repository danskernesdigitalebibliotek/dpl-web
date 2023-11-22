<?php

namespace Drupal\dpl_cms\Updater;

use Drupal\Core\Updater\Module as UpdaterModule;
use Drupal\Core\Updater\UpdaterInterface;

/**
 * Extending the core updater module class.
 *
 * We need to change the path
 * because we want to persist the modules in a volume.
 * A symlink is pointing from:
 * modules/local -> sites/default/files/modules_local
 * in order to complete the setup.
 */
class Module extends UpdaterModule implements UpdaterInterface {

  /**
   * {@inheritdoc}
   */
  public static function getRootDirectoryRelativePath() {
    return 'modules/local';
  }

}
