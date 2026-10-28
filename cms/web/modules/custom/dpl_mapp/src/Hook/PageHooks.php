<?php

declare(strict_types=1);

namespace Drupal\dpl_mapp\Hook;

use Drupal\Core\Cache\Cache;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Routing\AdminContext;
use Drupal\Core\Routing\RouteMatchInterface;

/**
 * Page hooks.
 */
class PageHooks {

  public function __construct(
    protected AdminContext $adminContext,
    protected RouteMatchInterface $currentRouteMatch,
    protected ConfigFactoryInterface $configFactory,
  ) {
  }

  /**
   * Add the Mapp Intelligence tracking script to patron facing pages.
   *
   * @param array<mixed> $page
   *   The page render array.
   */
  #[Hook('page_attachments')]
  public function addTrackingScript(array &$page): void {
    $is_admin_route = $this->adminContext->isAdminRoute();
    $route_name = $this->currentRouteMatch->getRouteName();
    $is_excluded_route = in_array($route_name, [
      'dpl_react_apps.search_result',
      'dpl_react_apps.work',
      'dpl_react_apps.advanced_search',
    ]);

    // Disable tracking on admin pages (we are only interested in patron
    // behavior) and on specific routes (some pages should only track data from
    // React apps)
    if ($is_admin_route || $is_excluded_route) {
      return;
    }

    $config = $this->configFactory->get('dpl_mapp.settings');

    $page['#cache']['tags'] = Cache::mergeTags($page['#cache']['tags'] ?? [], $config->getCacheTags());
    if ($config->get('id') && $config->get('domain')) {
      $page['#attached']['library'][] = 'dpl_mapp/dpl_mapp';
      $page['#attached']['drupalSettings']['dpl_mapp']['domain'] = $config->get('domain');
      $page['#attached']['drupalSettings']['dpl_mapp']['id'] = $config->get('id');
    }
  }

}
