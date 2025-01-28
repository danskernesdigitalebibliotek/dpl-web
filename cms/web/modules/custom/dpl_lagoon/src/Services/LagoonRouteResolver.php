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
    $routes = $this->getRoutes();
    // We take for granted that the first route is the main route.
    // Could be that we need to change this in the future.
    return $routes[0] ?? NULL;
  }

}
