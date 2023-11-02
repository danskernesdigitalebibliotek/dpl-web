<?php

namespace Drupal\dpl_dashboard;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles dashboard settings.
 */
class DplDashboardSettings extends DplReactConfigBase {

  const PAGE_SIZE_DESKTOP = 25;
  const PAGE_SIZE_MOBILE = 25;

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

}
