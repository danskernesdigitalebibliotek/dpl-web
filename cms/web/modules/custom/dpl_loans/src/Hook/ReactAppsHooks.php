<?php

declare(strict_types=1);

namespace Drupal\dpl_loans\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Url;

/**
 * React apps hooks for dpl_loans module.
 */
class ReactAppsHooks {

  /**
   * Expose the physical loans page URL to the React apps.
   *
   * @param array<mixed> $data
   *   Data for the React apps by reference.
   */
  #[Hook('dpl_react_apps_data')]
  public function addPhysicalLoansUrl(array &$data): void {
    $data['urls'] += [
      'physical-loans' => dpl_react_apps_ensure_url_is_string(
        Url::fromRoute('dpl_loans.list', [], ['absolute' => TRUE])->toString()
      ),
    ];
  }

}
