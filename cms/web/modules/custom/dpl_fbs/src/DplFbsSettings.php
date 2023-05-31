<?php

namespace Drupal\dpl_fbs;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles FBS settings.
 */
class DplFbsSettings extends DplReactConfigBase {

  /**
   * Gets the configuration key for FBS settings.
   */
  public function getConfigKey(): string {
    return 'dpl_fbs.settings';
  }

}
