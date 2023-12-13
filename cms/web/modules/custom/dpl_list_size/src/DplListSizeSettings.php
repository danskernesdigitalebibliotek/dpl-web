<?php

namespace Drupal\dpl_list_size;

use Drupal\dpl_react\DplReactConfigBase;

class DplListSizeSettings extends DplReactConfigBase {

  const DASHBOARD_LIST_SIZE_DESKTOP = 25;
  const DASHBOARD_LIST_SIZE_MOBILE = 25;
  const RESERVATION_LIST_SIZE_DESKTOP = 25;
  const RESERVATION_LIST_SIZE_MOBILE = 25;
  const LOAN_LIST_SIZE_DESKTOP = 25;
  const LOAN_LIST_SIZE_MOBILE = 25;
  const MENU_LIST_SIZE_DESKTOP = 25;
  const MENU_LIST_SIZE_MOBILE = 25;
  const FAVORITES_LIST_SIZE_DESKTOP = 25;
  const FAVORITES_SIZE_MOBILE = 25;

  /**
   * {@inheritdoc}
   */
  public function getConfig(): array {
    return $this->legacyConfig();
  }

  /**
   * Gets the configuration key for list size settings.
   */
  public function getConfigKey(): string
  {
    return 'dpl_list_size.settings';
  }
}
