<?php

namespace Drupal\dpl_patron_menu;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles menu settings.
 */
class DplMenuSettings extends DplReactConfigBase {

  const MENU_LIST_SIZE_DESKTOP = 25;
  const MENU_LIST_SIZE_MOBILE = 25;

  /**
   * Gets the configuration key for menu settings.
   */
  public function getConfigKey(): string {
    return 'dpl_patron_menu.settings';
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(): array {
    return $this->legacyConfig();
  }

}
