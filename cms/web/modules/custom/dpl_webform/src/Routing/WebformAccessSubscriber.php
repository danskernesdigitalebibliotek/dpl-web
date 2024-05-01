<?php

namespace Drupal\dpl_webform\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;

/**
 * Listens to the dynamic route events.
 */
class WebformAccessSubscriber extends RouteSubscriberBase {

  /**
   * {@inheritdoc}
   */
  protected function alterRoutes(RouteCollection $collection): void {
    if ($route = $collection->get('entity.webform.settings_access')) {
      $route->setRequirement('_permission', 'administer advanced webform access settings');
    }

    if ($route = $collection->get('entity.webform.settings_form')) {
      $route->setRequirement('_permission', 'administer advanced webform form settings');
    }

    if ($route = $collection->get('entity.webform.settings_submissions')) {
      $route->setRequirement('_permission', 'administer advanced webform submission settings');
    }
  }

}
