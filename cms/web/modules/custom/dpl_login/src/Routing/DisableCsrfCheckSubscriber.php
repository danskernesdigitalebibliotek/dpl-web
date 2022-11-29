<?php

namespace Drupal\dpl_login\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;

/**
 * Disable cross-site-request-forgery checks on token requests.
 *
 * Drupal will by default require a CSRF token to be included with
 * authenticated HTTP requests altering state.
 *
 * We hold the CMS to the same security levels as other business systems in the
 * NEXT platform. Thus we deem a valid user token sufficient and we remove
 * this requirement for all routes using the user token authentication
 * provider.
 *
 * @see \Drupal\Core\Access\CsrfRequestHeaderAccessCheck
 * @see \Drupal\dpl_login\UserTokenAuthProvider
 */
class DisableCsrfCheckSubscriber extends RouteSubscriberBase {

  /**
   * {@inheritdoc}
   */
  protected function alterRoutes(RouteCollection $collection): void {
    foreach ($collection->getIterator() as $route) {
      if ($route->getOption('_auth') == ["dpl_login_user_token"]) {
        $requirements = $route->getRequirements();
        unset($requirements['_csrf_request_header_token']);
        $route->setRequirements($requirements);
      }
    }
  }

}
