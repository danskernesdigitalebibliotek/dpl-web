<?php

declare(strict_types=1);

namespace Drupal\dpl_react_apps\Hook;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Url;
use Drupal\dpl_fees\DplFeesSettings;
use Drupal\dpl_library_agency\GeneralSettings;
use Drupal\dpl_login\Adgangsplatformen\Config;
use function Safe\json_encode;

/**
 * React apps hooks for dpl_react_apps module.
 */
class ReactAppsHooks {

  public function __construct(
    protected Config $adgangsplatformenConfig,
    protected GeneralSettings $generalSettings,
    protected DplFeesSettings $feesSettings,
  ) {}

  /**
   * Add the configs, texts and urls shared by all React apps.
   *
   * @param mixed[] $data
   *   The data to provide to the React apps.
   * @param mixed[] $variables
   *   The variables for the theme hook.
   */
  #[Hook('dpl_react_apps_data')]
  public function addGlobalData(array &$data, array &$variables): void {
    // Make sure that changed settings are invalidating the cache.
    $cache_metadata = CacheableMetadata::createFromRenderArray($variables);
    $cache_metadata->addCacheableDependency($this->adgangsplatformenConfig);
    $cache_metadata->addCacheableDependency($this->generalSettings);
    $cache_metadata->addCacheableDependency($this->feesSettings);
    $cache_metadata->applyTo($variables);

    // @todo We should use the adgangsplatform config everywhere we handle data that it can provide,
    // eg. login/logout urls.
    $data['configs'] += [
      'agency' => json_encode([
        'id' => $this->adgangsplatformenConfig->getAgencyId(),
      ]),
      'reservation-details' => json_encode($this->generalSettings->getReservationDetails()),
      'error-messages' => json_encode([
        'containerId' => 'dpl-react-apps-error-messages',
        'shouldOnlyShowOneError' => TRUE,
      ]),
    ];

    $data['texts'] += dpl_react_apps_texts();

    $data['urls'] += [
      'dpl-cms-base' => dpl_react_apps_get_dpl_cms_base_url(),
      'search' => dpl_react_apps_ensure_url_is_string(
        Url::fromRoute('dpl_react_apps.search_result')->toString()
      ),
      'advanced-search' => dpl_react_apps_ensure_url_is_string(
        Url::fromRoute('dpl_react_apps.advancedsearch')->toString()
      ),
      // React applications support variable replacement where variables are
      // prefixed with :. Specify the variable :workid as a parameter to let the
      // route build the url. Unfortunatly : will be encoded as %3A so we have
      // to decode the url again to make replacement work.
      'material' => urldecode(dpl_react_apps_ensure_url_is_string(
        Url::fromRoute('dpl_react_apps.work')
          ->setRouteParameter('wid', ':workid')
          ->toString()
      )),
      'series' => urldecode(dpl_react_apps_ensure_url_is_string(
        Url::fromRoute('dpl_react_apps.series')
          ->setRouteParameter('series_id', ':seriesid')
          ->toString()
      )),
      'logout' => dpl_react_apps_ensure_url_is_string(
        Url::fromRoute('dpl_login.logout', [], ['absolute' => TRUE])->toString()
      ),
      'auth' => dpl_react_apps_ensure_url_is_string(
        Url::fromRoute('dpl_login.login')->toString()
      ),
      'dashboard' => dpl_react_apps_ensure_url_is_string(
        Url::fromRoute('dpl_dashboard.list')->toString()
      ),
      'view-fees-and-compensation-rates' =>
      $this->feesSettings->getViewFeesAndCompensationRatesUrl(),
      'zero-hits-search' => $this->generalSettings->getZeroHitsSearchUrl(),
    ];

    if (!empty($this->feesSettings->getBlockedPatronElinkUrl())) {
      $data['urls'] += [
        'blocked-patron-e-link' => $this->feesSettings->getBlockedPatronElinkUrl(),
      ];
    }
  }

}
