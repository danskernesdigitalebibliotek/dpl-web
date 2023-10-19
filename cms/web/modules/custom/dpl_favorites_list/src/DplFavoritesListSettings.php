<?php

namespace Drupal\dpl_favorites_list;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles favorites list settings.
 */
class DplFavoritesListSettings extends DplReactConfigBase {

  const PAGE_SIZE_DESKTOP = 25;
  const PAGE_SIZE_MOBILE = 25;

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

}
