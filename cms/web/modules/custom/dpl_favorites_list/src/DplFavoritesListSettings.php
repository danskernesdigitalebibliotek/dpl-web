<?php

namespace Drupal\dpl_favorites_list;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles favorites list settings.
 */
class DplFavoritesListSettings extends DplReactConfigBase {

  /**
   * Gets the configuration key for favorites list settings.
   */
  public function getConfigKey(): string {
    return 'dpl_favorites_list.settings';
  }

}
