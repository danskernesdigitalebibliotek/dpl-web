<?php

namespace Drupal\dpl_dashboard;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles dashboard settings.
 */
class DplDashboardSettings extends DplReactConfigBase {

  /**
   * Gets the configuration key for dashboard settings.
   */
  public function getConfigKey(): string {
    return 'dpl_dashboard.settings';
  }

}
