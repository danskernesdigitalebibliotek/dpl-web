<?php

namespace Drupal\dpl_login;

use Drupal\Core\Authentication\AuthenticationProviderInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\openid_connect\OpenIDConnectAuthmap;
use Drupal\openid_connect\Plugin\OpenIDConnectClientInterface;
use Symfony\Component\HttpFoundation\Request;
use function Safe\preg_match as preg_match;

/**
 * Authentication provider with OAuth2 / OpenID Connect user token support.
 */
class UserTokenAuthProvider implements AuthenticationProviderInterface {

  /**
   * Constructor.
   */
  public function __construct(
    private OpenIDConnectClientInterface $client,
    private ModuleHandlerInterface $moduleHandler,
    private OpenIDConnectAuthmap $authmap,
  ) {}

  /**
   * Extract a bearer token from the authorization header of a request.
   */
  private function getToken(Request $request) : ?string {
    $header = $request->headers->get('Authorization');
    if (!$header) {
      return NULL;
    }

    preg_match('/^Bearer\s+(\w+)/', $header, $matches);
    return $matches[1] ?? NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function applies(Request $request) : bool {
    // If the request has a bearer token this provider applies. In general we
    // might have tokens for different systems and we might not know if a
    // specific token actually works with this setup but at least we can try.
    return (bool) $this->getToken($request);
  }

  /**
   * {@inheritdoc}
   */
  public function authenticate(Request $request) : ?AccountInterface {
    $token = $this->getToken($request);
    if (!$token) {
      return NULL;
    }

    $user_info = $this->client->retrieveUserInfo($token);
    if (!$user_info) {
      // No need to log here. Error logging is already handled by the client.
      return NULL;
    }
    // Allow modules to alter the user info.
    // This allows this module to add a "sub" entry denoting the unique
    // end-user (subject) identifier. This is needed for us to load the
    // associated Drupal user from the OpenID Connect authmap.
    $context = [];
    try {
      $this->moduleHandler->alter('openid_connect_userinfo', $user_info, $context);
    } catch (\Exception $e) {
      // Do nothing. If the token cannot resolve to a user then
      // dpl_login_openid_connect_userinfo_alter() will throw an exception.
      // However this is to be expected if this is a library token so in that
      // case continue.
    }
    if (!isset($user_info['sub'])) {
      return NULL;
    }

    $user = $this->authmap->userLoadBySub($user_info['sub'], $this->client->getPluginId());
    return ($user instanceof AccountInterface) ? $user : NULL;
  }

}
