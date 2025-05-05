<?php

namespace Drupal\dpl_lagoon\Services;

/**
 * Lagoon route resolver.
 */
class LagoonRouteResolver {

  /**
   * All available Lagoon routes.
   *
   * @var mixed[]
   */
  protected $routes;

  /**
   * Get all available Lagoon routes.
   *
   * @return mixed[]
   *   All available Lagoon routes.
   */
  protected function getRoutes(): array {
    if ($this->routes) {
      return $this->routes;
    }

    $this->routes = explode(',', getenv('LAGOON_ROUTES') ?: '');
    return $this->routes;
  }

  /**
   * Get the main Lagoon route.
   */
  public function getMainRoute(): string | null {
    // The main route is given in its own variable.
    $route = getenv('LAGOON_ROUTE');

    if ($route) {
      return $route;
    }

    // Else use the first in the list. It's likely not the primary (the list is
    // alphabetized), but at least it's something.
    $routes = $this->getRoutes();

    return $routes[0] ?? NULL;
  }

}
