<?php

namespace Drupal\dpl_login\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\Url;
use Drupal\dpl_login\Adgangsplatformen\Config;
use Drupal\dpl_login\Exception\MissingConfigurationException;
use Drupal\dpl_login\UserTokensProvider;
use Drupal\dpl_login\UserTokensProviderInterface;
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

  /**
   * The User token provider.
   *
   * @var \Drupal\dpl_login\UserTokensProviderInterface
   */
  protected userTokensProvider $userTokensProvider;
  /**
   * The Unregistered User token provider.
   *
   * @var \Drupal\dpl_login\UserTokensProviderInterface
   */
  protected userTokensProvider $unregisteredUserTokensProvider;
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
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;
  /**
   * The logger factory.
   *
   * @var \Drupal\Core\Logger\LoggerChannelFactoryInterface
   */
  protected $loggerFactory;

  /**
   * DdplReactController constructor.
   *
   * @param \Drupal\dpl_login\UserTokensProviderInterface $userTokensProvider
   *   The User token provider.
   * @param \Drupal\dpl_login\UserTokensProviderInterface $unregisteredUserTokensProvider
   *   The Unregistered User token provider.
   * @param \Drupal\dpl_login\Adgangsplatformen\Config $config
   *   Adgangsplatformen Config.
   * @param \Drupal\openid_connect\Plugin\OpenIDConnectClientInterface $client
   *   Adgangsplatformen Client.
   * @param \Drupal\openid_connect\OpenIDConnectClaims $claims
   *   The OpenID Connect claims.
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *   The current user.
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $logger_factory
   *   The logger factory.
   */
  public function __construct(
    UserTokensProviderInterface $userTokensProvider,
    UserTokensProviderInterface $unregisteredUserTokensProvider,
    Config $config,
    OpenIDConnectClientInterface $client,
    OpenIDConnectClaims $claims,
    AccountProxyInterface $current_user,
    LoggerChannelFactoryInterface $logger_factory
  ) {
    $this->userTokensProvider = $userTokensProvider;
    $this->unregisteredUserTokensProvider = $unregisteredUserTokensProvider;
    $this->config = $config;
    $this->client = $client;
    $this->claims = $claims;
    $this->currentUser = $current_user;
    $this->loggerFactory = $logger_factory;
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
      $container->get('dpl_login.unregistered_user_tokens'),
      $container->get('dpl_login.adgangsplatformen.config'),
      $container->get('dpl_login.adgangsplatformen.client'),
      $container->get('openid_connect.claims'),
      $container->get('current_user'),
      $container->get('logger.factory')
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

    return new TrustedRedirectResponse($url->toUriString());
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

  /**
   * Swap tokens.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Symfony request object.
   *
   * @return \Symfony\Component\HttpFoundation\Response
   *   A redirect to the authorization endpoint.
   */
  public function postRegister(Request $request): Response {
    $access_token = $this->unregisteredUserTokensProvider->getAccessToken();
    $logger = $this->loggerFactory->get('dpl_login');

    if (_dpl_login_delete_previous_user_tokens()) {
      $logger->info('Post register - Previous user tokens were deleted.');
      $this->userTokensProvider->setAccessToken($access_token);
      $logger->info('Post register - User token was set.');
    }
    else {
      $logger->error('Post register - Unable to delete previous user tokens.');
    }

    if ($current_path = $request->query->get('current-path')) {
      return new TrustedRedirectResponse($current_path);
    }

    return new Response();
  }

}
