<?php

declare(strict_types=1);

namespace Drupal\dpl_fbi\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\dpl_fbi\Fbi;

/**
 * React apps API URLs.
 */
class ReactAppsApiUrls {

  public function __construct(protected Fbi $fbi) {}

  /**
   * API URLs for FBI.
   *
   * @return array<string, string>
   *   Service to URL mapping.
   */
  #[Hook('dpl_react_apps_api_urls')]
  public function reactApiUrls(): array {
    return $this->fbi->getServiceUrls();
  }

}
