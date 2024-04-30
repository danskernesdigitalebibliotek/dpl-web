<?php

namespace Drupal\dpl_event\Routing;

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
    if ($route = $collection->get('view.event_instance_list.page_1')) {
      $route->setRequirement('_access_event_series_instances_tab', 'TRUE');
    }
  }

}
