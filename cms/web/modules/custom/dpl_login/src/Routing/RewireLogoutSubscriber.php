<?php

namespace Drupal\dpl_login\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;

/**
 * Listens to the dynamic route events.
 */
class RewireLogoutSubscriber extends RouteSubscriberBase {

  /**
   * {@inheritdoc}
   */
  protected function alterRoutes(RouteCollection $collection): void {
    // Rewire the core logout route to ours
    // so we can logout users remotely as well.
    if ($route = $collection->get('user.logout')) {
      $route->setPath('/logout');
    }
  }

}
