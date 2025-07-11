<?php

declare(strict_types=1);

namespace Drupal\dpl_fbi;

use Drupal\dpl_library_agency\GeneralSettings;

/**
 * The FBI service.
 */
class Fbi {

  /**
   * @todo Move the profile configuration to this module.
   */
  public function __construct(protected GeneralSettings $agencySettings) {}

  /**
   * Get profile names.
   *
   * @return array<string, string>
   *   Profile type to name mapping.
   */
  public function getProfiles(): array {
    return $this->agencySettings->getFbiProfiles();
  }

}
