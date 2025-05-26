<?php

namespace Drupal\dpl_login;

use Drupal\Core\Authentication\AuthenticationProviderInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\externalauth\ExternalAuthInterface;
use Drupal\openid_connect\Plugin\OpenIDConnectClientInterface;
use Symfony\Component\HttpFoundation\Request;
use function Safe\preg_match as preg_match;

/**
 * Authentication provider with OAuth2 / OpenID Connect user token support.
 */
class UserTokenAuthProvider implements AuthenticationProviderInterface {

  /**
   * A map of known responses to authentication from token.
   *
   * @var array<string, ?AccountInterface>
   */
  private array $authMap = [];

  /**
   * Constructor.
   */
  public function __construct(
    private OpenIDConnectClientInterface $client,
    private ModuleHandlerInterface $moduleHandler,
    private ExternalAuthInterface $externalAuth,
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
    // We only know if this provider applies if we can actually resolve the
    // request to a user. Clients may pass either user or library tokens.
    // We cannot tell from the data alone which is which so we have to try
    // to authenticate to see if it will resolve to a user to know.
    return (bool) $this->authenticate($request);
  }

  /**
   * {@inheritdoc}
   */
  public function authenticate(Request $request) : ?AccountInterface {
    $token = $this->getToken($request);
    if (!$token) {
      return NULL;
    }

    // Add static caching of user authentication. This method will be called
    // multiple times with the same request and retrieving user info and
    // loading the user may be expensive.
    if (array_key_exists($token, $this->authMap)) {
      return $this->authMap[$token];
    }

    $return = NULL;

    $user_info = $this->client->retrieveUserInfo($token);
    if ($user_info) {
      // Allow modules to alter the user info.
      // This allows this module to add a "sub" entry denoting the unique
      // end-user (subject) identifier. This is needed for us to load the
      // associated Drupal user from the ExternalAuth authmap.
      $context['plugin_id'] = $this->client->getPluginId();
      try {
        $this->moduleHandler->alter('openid_connect_userinfo', $user_info, $context);
      }
      catch (\Exception $e) {
        // Do nothing. If the token cannot resolve to a user then
        // dpl_login_openid_connect_userinfo_alter() will throw an exception.
        // However this is to be expected if this is a library token so in that
        // case continue.
      }
      if (isset($user_info['sub'])) {
        $user = $this->externalAuth->load($user_info['sub'], $this->client->getPluginId());
        $return = ($user instanceof AccountInterface) ? $user : NULL;
      }
    }

    $this->authMap[$token] = $return;
    return $return;
  }

}
