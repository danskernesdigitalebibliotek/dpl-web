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

    // recurring_events declares an event instance overview at /events and marks
    // it as an administration route. Our own event overview view lives at that
    // same path, so views replaces the route with ours - but the route keeps
    // the administration flag, which renders our public event overview in the
    // admin theme, without the site header and footer.
    if ($route = $collection->get('entity.eventinstance.collection')) {
      $route->setOption('_admin_route', FALSE);
    }
  }

}
