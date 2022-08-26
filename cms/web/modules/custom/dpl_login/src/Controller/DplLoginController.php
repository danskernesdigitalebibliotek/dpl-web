<?php

namespace Drupal\dpl_login\Controller;

use Drupal\Core\Url;
use Drupal\dpl_login\UserTokensProvider;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\dpl_login\Exception\MissingConfigurationException;
use Drupal\openid_connect\Plugin\OpenIDConnectClientManager;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * DPL React Controller.
 */
class DplLoginController extends ControllerBase {
  use StringTranslationTrait;

  const LOGGER_KEY = 'dpl_login';
  const CLIENT_NAME = 'adgangsplatformen';

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
   * @var mixed[]
   */
  protected $settings;
  /**
   * Openid Connect Plugin Manager.
   *
   * @var \Drupal\openid_connect\Plugin\OpenIDConnectClientManager
   */
  protected $pluginManager;

  /**
   * DdplReactController constructor.
   *
   * @param \Drupal\dpl_login\UserTokensProvider $userTokensProvider
   *   The User token provider.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Configuration.
   * @param \Drupal\openid_connect\Plugin\OpenIDConnectClientManager $pluginManager
   *   Openid Connect Plugin Manager.
   */
  public function __construct(
    UserTokensProvider $userTokensProvider,
    ConfigFactoryInterface $configFactory,
    OpenIDConnectClientManager $pluginManager,
  ) {
    $this->userTokensProvider = $userTokensProvider;
    $this->settings = $configFactory
      ->get($this->getSettingsKey())->get('settings');
    $this->pluginManager = $pluginManager;
    $this->configFactory = $configFactory;
  }

  /**
   * Get the settings scope for the openid_connect settings.
   *
   * @return string
   *   The settings scope for the openid_connect settings.
   */
  protected function getSettingsKey(): string {
    return 'openid_connect.settings.' . self::CLIENT_NAME;
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
      $container->get('config.factory'),
      $container->get('openid_connect.session'),
      $container->get('plugin.manager.openid_connect_client'),
    );
  }

  /**
   * Logs out user externally and internally.
   *
   * @todo Insert TrustedRedirectResponse|RedirectResponse as return type when going to PHP ^8.0.
   *
   * @return \Drupal\Core\Routing\TrustedRedirectResponse|\Symfony\Component\HttpFoundation\RedirectResponse
   *   Redirect to external logout service or front if not possible.
   */
  public function logout() {
    // It is a global problem if the logout endpoint has not been configured.
    // @todo This could be moved to a new service
    // handling adgangsplatform configuration.
    // @see dpl_login_install() and \Drupal\dpl_library_token\LibraryTokenHandler.
    if (!$logout_endpoint = $this->settings['logout_endpoint'] ?? NULL) {
      throw new MissingConfigurationException('Adgangsplatformen plugin config variable logout_endpoint is missing');
    }

    $access_token = $this->userTokensProvider->getAccessToken();

    // Log out user in Drupal.
    // We do this regardless wether it is possible to logout remotely or not.
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
   * @return \Drupal\Core\Routing\TrustedRedirectResponse
   *   A redirect to the authorization endpoint.
   */
  public function authorizeFromApp(Request $request): TrustedRedirectResponse {
    if ($current_path = $request->query->get('current-path')) {
      $_SESSION['openid_connect_destination'] = $current_path;
    }

    /** @var \Drupal\openid_connect\Plugin\OpenIDConnectClientInterface $client */
    $client = $this->pluginManager->createInstance(
      self::CLIENT_NAME,
      $this->settings
    );

    return new TrustedRedirectResponse($client->getAuthorizationEndpointUrl("openid email profile"));
  }

}
