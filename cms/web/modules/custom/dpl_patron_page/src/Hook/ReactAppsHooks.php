<?php

declare(strict_types=1);

namespace Drupal\dpl_patron_page\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Url;

/**
 * React apps hooks for dpl_patron_page module.
 */
class ReactAppsHooks {

  /**
   * Expose the user profile page URL to the React apps.
   *
   * @param array<mixed> $data
   *   Data for the React apps by reference.
   */
  #[Hook('dpl_react_apps_data')]
  public function addUserProfileUrl(array &$data): void {
    $data['urls'] += [
      'user-profile' => dpl_react_apps_ensure_url_is_string(
        Url::fromRoute('dpl_patron_page.profile', [], ['absolute' => TRUE])->toString()
      ),
    ];
  }

}
