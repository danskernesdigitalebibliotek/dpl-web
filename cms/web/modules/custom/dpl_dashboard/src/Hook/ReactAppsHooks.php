<?php

declare(strict_types=1);

namespace Drupal\dpl_dashboard\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Url;

/**
 * React apps hooks.
 */
class ReactAppsHooks {

  /**
   * Expose the dashboard URL to the React apps.
   *
   * @param array<mixed> $data
   *   Data for the React apps by reference.
   */
  #[Hook('dpl_react_apps_data')]
  public function addDashboardUrl(array &$data): void {
    $data['urls'] += [
      'dashboard' => dpl_react_apps_ensure_url_is_string(
        Url::fromRoute('dpl_dashboard.list', [], ['absolute' => TRUE])->toString()
      ),
    ];
  }

}
