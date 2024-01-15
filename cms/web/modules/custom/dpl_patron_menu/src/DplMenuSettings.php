<?php

namespace Drupal\dpl_patron_menu;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles menu settings.
 */
class DplMenuSettings extends DplReactConfigBase {

  const PATRON_MENU_LIST_SIZE_DESKTOP = 25;
  const PATRON_MENU_LIST_SIZE_MOBILE = 25;

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

  /**
   * Get the desktop list size.
   *
   * @return string
   *   The desktop list size or the fallback value.
   */
  public function getListSizeDesktop(): string {
    return $this->loadConfig()->get('patron_menu_list_size_desktop') ?? self::PATRON_MENU_LIST_SIZE_DESKTOP;
  }

  /**
   * Get the mobile list size.
   *
   * @return string
   *   The mobile list size or the fallback value.
   */
  public function getListSizeMobile(): string {
    return $this->loadConfig()->get('patron_menu_list_size_mobile') ?? self::PATRON_MENU_LIST_SIZE_MOBILE;
  }

}
