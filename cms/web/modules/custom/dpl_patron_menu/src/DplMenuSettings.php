<?php

namespace Drupal\dpl_patron_menu;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles menu settings.
 */
class DplMenuSettings extends DplReactConfigBase {

  /**
   * Gets the configuration key for menu settings.
   */
  public function getConfigKey(): string {
    return 'dpl_patron_menu.settings';
  }

}
