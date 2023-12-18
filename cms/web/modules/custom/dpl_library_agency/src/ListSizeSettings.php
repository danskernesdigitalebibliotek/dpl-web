<?php

namespace Drupal\dpl_library_agency;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles list size settings.
 */
class ListSizeSettings extends DplReactConfigBase
{
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
  public function getConfig(): array
  {
    return $this->loadConfig()->get();
  }

  /**
   * Gets the configuration key for list size settings.
   */
  public function getConfigKey(): string
  {
    return 'dpl_library_agency.list_size_settings';
  }
}
