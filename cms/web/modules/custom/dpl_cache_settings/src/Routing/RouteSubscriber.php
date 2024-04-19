<?php

namespace Drupal\dpl_cache_settings\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;

/**
 * Listens to the dynamic route events.
 */
class RouteSubscriber extends RouteSubscriberBase {

  /**
   * {@inheritdoc}
   */
  protected function alterRoutes(RouteCollection $collection): void {
    // Change permissions for /admin/config/development/performance.
    // We only want uid1 to have access - the rest, will have access through
    // our custom form.
    if ($route = $collection->get('system.performance_settings')) {
      $route->setRequirement('_permission', 'access drupal performance settings');
    }
  }

}
