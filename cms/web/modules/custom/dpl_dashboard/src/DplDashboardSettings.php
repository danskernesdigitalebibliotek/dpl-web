<?php

namespace Drupal\dpl_dashboard;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles dashboard settings.
 */
class DplDashboardSettings extends DplReactConfigBase {

  const DASHBOARD_LIST_SIZE_DESKTOP = 25;
  const DASHBOARD_LIST_SIZE_MOBILE = 25;

  /**
   * Gets the configuration key for dashboard settings.
   */
  public function getConfigKey(): string {
    return 'dpl_dashboard.settings';
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
    return $this->loadConfig()->get('dashboard_list_size_desktop') ?? self::DASHBOARD_LIST_SIZE_DESKTOP;
  }

  /**
   * Get the mobile list size.
   *
   * @return string
   *   The mobile list size or the fallback value.
   */
  public function getListSizeMobile(): string {
    return $this->loadConfig()->get('dashboard_list_size_mobile') ?? self::DASHBOARD_LIST_SIZE_MOBILE;
  }

}
