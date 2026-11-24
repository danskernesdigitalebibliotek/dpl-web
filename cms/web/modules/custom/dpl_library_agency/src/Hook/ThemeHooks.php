<?php

declare(strict_types=1);

namespace Drupal\dpl_library_agency\Hook;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\dpl_library_agency\GeneralSettings;

/**
 * Theme hooks for dpl_library_agency module.
 */
class ThemeHooks {

  public function __construct(
    protected ConfigFactoryInterface $configFactory,
  ) {}

  /**
   * Add the opening hours URL to the page.
   *
   * @param array<mixed> $variables
   *   The page variables.
   */
  #[Hook('preprocess_page')]
  public function addOpeningHoursUrl(array &$variables): void {
    $config = $this->configFactory->get('dpl_library_agency.general_settings');
    $variables['opening_hours_url'] = $config->get('opening_hours_url') ?? GeneralSettings::OPENING_HOURS_URL;
  }

}
