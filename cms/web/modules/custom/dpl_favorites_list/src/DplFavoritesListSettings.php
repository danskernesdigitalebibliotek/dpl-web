<?php

namespace Drupal\dpl_favorites_list;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles favorites list settings.
 */
class DplFavoritesListSettings extends DplReactConfigBase {

  const FAVORITES_LIST_SIZE_DESKTOP = 25;
  const FAVORITES_LIST_SIZE_MOBILE = 25;

  /**
   * Gets the configuration key for favorites list settings.
   */
  public function getConfigKey(): string {
    return 'dpl_favorites_list.settings';
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
    return $this->loadConfig()->get('favorites_list_size_desktop') ?? self::FAVORITES_LIST_SIZE_DESKTOP;
  }

  /**
   * Get the mobile list size.
   *
   * @return string
   *   The mobile list size or the fallback value.
   */
  public function getListSizeMobile(): string {
    return $this->loadConfig()->get('favorites_list_size_mobile') ?? self::FAVORITES_LIST_SIZE_MOBILE;
  }

}
