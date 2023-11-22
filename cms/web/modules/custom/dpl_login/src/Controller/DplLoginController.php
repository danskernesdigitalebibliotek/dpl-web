<?php

namespace Drupal\dpl_login\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\Url;
use Drupal\dpl_login\Adgangsplatformen\Config;
use Drupal\dpl_login\Exception\MissingConfigurationException;
use Drupal\dpl_login\UserTokensProvider;
use Drupal\openid_connect\OpenIDConnectClaims;
use Drupal\openid_connect\Plugin\OpenIDConnectClientInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * DPL React Controller.
 */
class DplLoginController extends ControllerBase {
  use StringTranslationTrait;

  const LOGGER_KEY = 'dpl_login';

  /**
   * The User token provider.
   *
   * @var \Drupal\dpl_login\UserTokensProvider
   */
  protected userTokensProvider $userTokensProvider;
  /**
   * The Messenger service.
   *
   * @var \Drupal\Core\Messenger\MessengerInterface
   */
  protected $messenger;
  /**
   * Configuration.
   *
   * @var \Drupal\dpl_login\Adgangsplatformen\Config
   */
  protected $config;
  /**
   * Openid Connect Client.
   *
   * @var \Drupal\openid_connect\Plugin\OpenIDConnectClientInterface
   */
  protected $client;
  /**
   * The OpenID Connect claims.
   *
   * @var \Drupal\openid_connect\OpenIDConnectClaims
   */
  protected $claims;

  /**
   * DdplReactController constructor.
   *
   * @param \Drupal\dpl_login\UserTokensProvider $userTokensProvider
   *   The User token provider.
   * @param \Drupal\dpl_login\Adgangsplatformen\Config $config
   *   Adgangsplatformen Config.
   * @param \Drupal\openid_connect\Plugin\OpenIDConnectClientInterface $client
   *   Adgangsplatformen Client.
   * @param \Drupal\openid_connect\OpenIDConnectClaims $claims
   *   The OpenID Connect claims.
   */
  public function __construct(
    UserTokensProvider $userTokensProvider,
    Config $config,
    OpenIDConnectClientInterface $client,
    OpenIDConnectClaims $claims,
  ) {
    $this->userTokensProvider = $userTokensProvider;
    $this->config = $config;
    $this->client = $client;
    $this->claims = $claims;
  }

  /**
   * {@inheritdoc}
   *
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   *   The Drupal service container.
   *
   * @return static
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('dpl_login.user_tokens'),
      $container->get('dpl_login.adgangsplatformen.config'),
      $container->get('dpl_login.adgangsplatformen.client'),
      $container->get('openid_connect.claims'),
    );
  }

  /**
   * Logs out user externally and internally.
   *
   * @return \Drupal\Core\Routing\TrustedRedirectResponse|\Symfony\Component\HttpFoundation\RedirectResponse
   *   Redirect to external logout service or front if not possible.
   *
   * @throws \Drupal\dpl_login\Exception\MissingConfigurationException
   */
  public function logout(): TrustedRedirectResponse|RedirectResponse {
    // It is a global problem if the logout endpoint has not been configured.
    if (!$logout_endpoint = $this->config->getLogoutEndpoint()) {
      throw new MissingConfigurationException('Adgangsplatformen plugin config variable logout_endpoint is missing');
    }

    $access_token = $this->userTokensProvider->getAccessToken();

    // Log out user in Drupal.
    // We do this regardless whether it is possible to logout remotely or not.
    // We do not want the user to get stuck on the site in a logged in state.
    user_logout();

    // Handle case of a user that is either:
    // NOT authenticated by Adgangsplatformen
    // or is missing its access token.
    if (!$access_token) {
      return $this->redirect('<front>');
    }

    // Create url for logout service that it should redirect back to.
    // Since toString(TRUE) is called
    // we know that the return value of toString() is GeneratedUrl
    // and consequently we are able to call getGeneratedUrl in the end.
    /* @phpstan-ignore-next-line */
    $redirect_uri = Url::fromRoute('<front>', [], ["absolute" => TRUE])
      ->toString(TRUE)
      ->getGeneratedUrl();

    // Remote logout service url.
    $url = Url::fromUri($logout_endpoint, [
      'query' => [
        'singlelogout' => 'true',
        'access_token' => $access_token->token,
        'redirect_uri' => $redirect_uri,
      ],
    ]);

    return TrustedRedirectResponse::create($url->toUriString());
  }

  /**
   * Authorize user from embedded app.
   *
   * Retrieve current path parameter, store it in session for later redirect
   * and authorize user.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Symfony request object.
   *
   * @return \Symfony\Component\HttpFoundation\Response
   *   A redirect to the authorization endpoint.
   */
  public function login(Request $request): Response {
    $_SESSION['openid_connect_op'] = 'login';
    if ($current_path = $request->query->get('current-path')) {
      $_SESSION['openid_connect_destination'] = $current_path;
    }

    $scopes = $this->claims->getScopes($this->client);
    return $this->client->authorize($scopes);
  }

}
