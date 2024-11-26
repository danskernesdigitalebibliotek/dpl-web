<?php

namespace Drupal\dpl_graphql\PageCache;

use Drupal\simple_oauth\PageCache\SimpleOauthRequestPolicyInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Do not serve a page from cache if OAuth2 authentication is applicable.
 *
 * @internal
 */
class DplDisallowSimpleOauthRequests implements SimpleOauthRequestPolicyInterface {

  /**
   * {@inheritdoc}
   */
  public function isOauth2Request(Request $request) {

    // Check if the request URL starts with /graphql.
    if (strpos($request->getPathInfo(), '/graphql') !== 0) {
      return FALSE;
    }

    // Check the header. See: http://tools.ietf.org/html/rfc6750#section-2.1
    // We have to perform also an exact match, as if no token is provided then
    // the LWS might be stripped, but we still have to detect this as OAuth2
    // authentication. See: https://www.ietf.org/rfc/rfc2616.txt
    $auth_header = trim($request->headers->get('Authorization') ?? '');
    return (strpos($auth_header, 'Bearer ') !== FALSE) || ($auth_header === 'Bearer');
  }

  /**
   * {@inheritdoc}
   */
  public function check(Request $request) {
    return $this->isOauth2Request($request) ? static::DENY : NULL;
  }

}
