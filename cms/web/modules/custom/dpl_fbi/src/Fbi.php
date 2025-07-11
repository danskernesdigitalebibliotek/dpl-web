<?php

declare(strict_types=1);

namespace Drupal\dpl_fbi;

use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\dpl_library_agency\GeneralSettings;
use function Safe\preg_replace;

/**
 * The FBI service.
 */
class Fbi {

  /**
   * Configuration.
   */
  protected ImmutableConfig $config;

  /**
   * Constructor.
   *
   * @todo Move the profile configuration to this module.
   */
  public function __construct(
    protected GeneralSettings $agencySettings,
    ConfigFactoryInterface $configFactory,
  ) {
    $this->config = $configFactory->get('dpl_fbi.settings');
  }

  /**
   * Get profile names.
   *
   * @return array<string, string>
   *   Profile type to name mapping.
   */
  public function getProfiles(): array {
    return $this->agencySettings->getFbiProfiles();
  }

  /**
   * Get API URLs for FBI.
   *
   * @return array<string, string>
   *   Service to URL mapping.
   */
  public function getServiceUrls(): array {
    $baseUrl = $this->config->get('base_url');

    $urls = [];
    // Create an URL for each profile.
    if ($baseUrl) {
      foreach ($this->getProfiles() as $type => $profile) {
        // The default FBI service has its own key with no suffix.
        $service_key = $type === FbiProfileType::Default->value ? 'fbi' : sprintf('fbi-%s', $type);

        // Create a service url with the profile embedded.
        $base_url = preg_replace('/\[profile\]/', $profile, $baseUrl);
        $urls[$service_key] = $base_url;
      }
    }

    return $urls;
  }

}
