<?php

declare(strict_types=1);

namespace Drupal\dpl_opening_hours\EventSubscriber;

use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\Route;
use Symfony\Component\Routing\RouteCollection;

/**
 * Remove X-CSRF protection for opening hours API.
 *
 * This reduces the complexity of calling the API as the caller no longer has
 * to obtain a token before making the actual request.
 */
final class ApiRouteSubscriber extends RouteSubscriberBase {

  /**
   * {@inheritdoc}
   */
  protected function alterRoutes(RouteCollection $collection): void {
    $routes = [
      'rest.dpl_opening_hours_delete.DELETE',
      'rest.dpl_opening_hours_update.PATCH',
      'rest.dpl_opening_hours_create.POST',
    ];
    $routes = array_filter(array_map(function (string $route) use ($collection): ?Route {
      return $collection->get($route);
    }, $routes));
    array_walk($routes, function (Route $route) {
      $req = $route->getRequirements();
      unset($req['_csrf_request_header_token']);
      $route->setRequirements($req);
    });
  }

}
