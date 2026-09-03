<?php

declare(strict_types=1);

namespace Drupal\dpl_biblio\Hook;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\dpl_biblio\DplBiblioSettings;

/**
 * React apps integration for the Biblio adapter.
 */
class ReactAppsHooks {

  /**
   * The React apps that mount the WeDoBooks SDK.
   */
  private const SDK_APPS = ['reader', 'player'];

  public function __construct(protected DplBiblioSettings $biblioSettings) {}

  /**
   * API URLs for the Biblio adapter.
   *
   * @return array<string, string>
   *   Service to URL mapping.
   */
  #[Hook('dpl_react_apps_api_urls')]
  public function reactApiUrls(): array {
    if (!$base_url = $this->biblioSettings->getBaseUrl()) {
      return [];
    }

    return [
      'biblio' => $base_url,
    ];
  }

  /**
   * Expose the Biblio adapter feature flag to all React apps.
   *
   * The flag ends up as data-use-biblio-adapter-config. The WeDoBooks SDK
   * configuration goes to the reader and the player only.
   *
   * @param mixed[] $data
   *   The data to provide to the React apps.
   * @param mixed[] $variables
   *   The variables for the theme hook.
   */
  #[Hook('dpl_react_apps_data')]
  public function reactAppsData(array &$data, array &$variables): void {
    // Make sure that changed settings are invalidating the cache.
    $cache_metadata = CacheableMetadata::createFromRenderArray($variables);
    $cache_metadata->addCacheableDependency($this->biblioSettings);
    $cache_metadata->applyTo($variables);

    $data['configs'] += [
      'use-biblio-adapter' => $this->biblioSettings->isEnabled() ? '1' : '0',
      // TEMPORARY, see DplBiblioSettings::shouldTolerateUnknownMaterials().
      'biblio-tolerate-unknown-materials' => $this->biblioSettings->shouldTolerateUnknownMaterials() ? '1' : '0',
    ];

    // The reader and the player run on the WeDoBooks SDK, which is configured
    // in the browser - and they are the only apps that do, so the keys stay
    // off every other app's markup. Left out entirely when unconfigured, so
    // React can tell "no SDK here" from "SDK with blank values".
    if (!in_array($variables['name'] ?? NULL, self::SDK_APPS, TRUE)) {
      return;
    }
    if ($sdk_config = $this->biblioSettings->getSdkConfig()) {
      $data['configs'] += $sdk_config;
    }
  }

}
