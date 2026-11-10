<?php

declare(strict_types=1);

namespace Drupal\dpl_login\Hook;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Hook\Attribute\Hook;

/**
 * React apps integration for dpl_login module.
 */
class ReactAppsHooks {

  public function __construct(protected ConfigFactoryInterface $configFactory) {}

  /**
   * Expose the Adgangsplatformen userinfo endpoint to the React apps.
   *
   * @param mixed[] $data
   *   The data to provide to the React apps.
   * @param mixed[] $variables
   *   The variables for the theme hook.
   */
  #[Hook('dpl_react_apps_data')]
  public function addUserinfoUrl(array &$data, array &$variables): void {
    $openid_config = $this->configFactory->get('openid_connect.client.adgangsplatformen');
    // Make sure that changed settings are invalidating the cache.
    $cache_metadata = CacheableMetadata::createFromRenderArray($variables);
    $cache_metadata->addCacheableDependency($openid_config);
    $cache_metadata->applyTo($variables);

    $data['urls'] += [
      'userinfo' => $openid_config->get('settings')['userinfo_endpoint'] ?? '/',
    ];
  }

}
