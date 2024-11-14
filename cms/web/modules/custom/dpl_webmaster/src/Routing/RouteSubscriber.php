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
  }

}
