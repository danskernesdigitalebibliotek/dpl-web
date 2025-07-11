<?php

declare(strict_types=1);

namespace Drupal\dpl_fbi\Hook;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\dpl_library_agency\FbiProfileType;
use Drupal\dpl_library_agency\GeneralSettings;
use function Safe\preg_replace;

/**
 * React apps API URLs.
 */
class ReactAppsApiUrls {

  /**
   * Configuration.
   */
  protected ImmutableConfig $config;

  public function __construct(
    ConfigFactoryInterface $configFactory,
    protected GeneralSettings $agencySettings,
  ) {
    // @todo The profile settings belong in this module too, as does the
    // FbiProfileType enum.
    $this->config = $configFactory->get('dpl_fbi.settings');
  }

  /**
   * API URLs for FBI.
   *
   * @return array<string, string>
   *   Service to URL mapping.
   */
  #[Hook('dpl_react_apps_api_urls')]
  public function reactApiUrls(): array {
    $baseUrl = $this->config->get('base_url');

    $apiUrls = [];

    // The base url of the FBI service is a special case
    // because a part (the profile) of the base url can differ.
    if ($baseUrl) {
      foreach ($this->agencySettings->getFbiProfiles() as $type => $profile) {
        $service_key = sprintf('fbi-%s', $type);
        // The default FBI service has its own key with no suffix.
        if ($type === FbiProfileType::DEFAULT->value) {
          $service_key = 'fbi';
        }
        // Create a service url with the profile embedded.
        $base_url = preg_replace('/\[profile\]/', $profile, $baseUrl);
        $apiUrls[$service_key] = $base_url;
      }
    }

    return $apiUrls;
  }

}
