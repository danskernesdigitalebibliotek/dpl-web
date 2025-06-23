<?php

declare(strict_types=1);

namespace Drupal\dpl_go;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;

/**
 * Ensures `www.` prefix is stripped from cookie_domain.
 *
 * On sites whose primary domain starts with `www`, Drupal sets the cookie
 * domain to `.www.<site>` per default. This means that the cookie isn't shared
 * with `www.go.<site>` and the login doesn't work. In these cases we set it
 * explicitly without the `.www` prefix.
 */
class DplGoServiceProvider extends ServiceProviderBase {

  /**
   * {@inheritdoc}
   */
  public function alter(ContainerBuilder $container): void {
    $parameter = 'session.storage.options';

    if (!$container->getParameterBag()->has($parameter)) {
      return;
    }

    /** @var array<string, string> $cookieSettings */
    $cookieSettings = $container->getParameter($parameter);

    // The cookie_domain shouldn't be set as this comes directly from the
    // services.yml file, but for safety, use any configured value.
    if (isset($cookieSettings['cookie_domain'])) {
      $cookieDomain = $cookieSettings['cookie_domain'];
    }
    else {
      // We can't use the service from `dpl_lagoon` for this, as obviously we
      // can't use the container while building it.
      $route = getenv('LAGOON_ROUTE');

      if (!$route) {
        // Without a route, we can't do much.
        return;
      }

      // Split off the scheme.
      $parts = explode('//', $route, 2);

      if (!isset($parts[1]) || !$parts[1]) {
        return;
      }

      // Add the dot to mimic how Drupal generates it.
      $cookieDomain = '.' . $parts[1];
    }

    // If there's no www prefix, we don't need to do anything.
    if (!str_starts_with($cookieDomain, '.www.')) {
      return;
    }

    $cookieDomain = substr($cookieDomain, 4);

    $cookieSettings['cookie_domain'] = $cookieDomain;

    $container->setParameter($parameter, $cookieSettings);
  }

}
