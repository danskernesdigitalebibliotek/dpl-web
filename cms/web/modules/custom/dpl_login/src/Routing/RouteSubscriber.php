<?php

namespace Drupal\dpl_login\Routing;

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
    // The oauth client setting is validating the redirect url
    // and expect it to be: /adgangsplatformen/callback.
    // We rewire the routing and point the route
    // to the callback of openid_connect.
    // And send the plugin id along the way (client_name)
    // so openid_connect kbnows which plugin to use.
    //
    // @see Drupal\dpl_login\Plugin\OpenIDConnectClient\Adgangsplatformen.
    if ($route = $collection->get('openid_connect.redirect_controller_redirect')) {
      $route->setPath('/adgangsplatformen/callback');
      $route->setDefault('client_name', 'adgangsplatformen');
    }
  }

}
