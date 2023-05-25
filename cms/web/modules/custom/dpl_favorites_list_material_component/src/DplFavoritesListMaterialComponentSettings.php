<?php

namespace Drupal\dpl_favorites_list_material_component;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles reservations settings.
 */
class DplFavoritesListMaterialComponentSettings extends DplReactConfigBase {

  /**
   * Gets the configuration key for reservation settings.
   */
  public function getConfigKey(): string {
    return 'dpl_favorites_list_material_component.settings';
  }

}
