<?php

declare(strict_types=1);

namespace Drupal\dpl_fees\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Url;

/**
 * React apps hooks for dpl_fees module.
 */
class ReactAppsHooks {

  /**
   * Expose the fees page URL to the React apps.
   *
   * @param array<mixed> $data
   *   Data for the React apps by reference.
   */
  #[Hook('dpl_react_apps_data')]
  public function addFeePageUrl(array &$data): void {
    $data['urls'] += [
      'fee-page' => dpl_react_apps_ensure_url_is_string(
        Url::fromRoute('dpl_fees.list', [], ['absolute' => TRUE])->toString()
      ),
    ];
  }

}
