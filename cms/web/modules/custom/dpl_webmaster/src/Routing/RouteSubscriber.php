<?php

declare(strict_types=1);

namespace Drupal\dpl_webmaster\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;

/**
 * Hide some update module routes.
 */
class RouteSubscriber extends RouteSubscriberBase {

  /**
   * {@inheritdoc}
   */
  protected function alterRoutes(RouteCollection $collection): void {
    // Remove /admin/modules/install, we provide an replacement that handles
    // updates too.
    if ($route = $collection->get('update.module_install')) {
      $route->setRequirement('_access', 'FALSE');
    }

    // Remove /admin/modules/update. It won't work for the majority of the
    // listed modules (webmasters can't update contrib modules provided by DPL
    // anyway). Limiting it to webmaster uploaded, Drupal contrib modules would
    // be a nicer alternative, but currently out of scope.
    if ($route = $collection->get('update.module_update')) {
      $route->setRequirement('_access', 'FALSE');
    }
  }

}
