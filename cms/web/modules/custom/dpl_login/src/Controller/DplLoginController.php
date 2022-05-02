<?php

namespace Drupal\dpl_login\Controller;

use Drupal\Core\Url;
use Drupal\dpl_login\UserTokensProvider;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\dpl_login\Exception\MissingConfigurationException;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * DPL React Controller.
 */
class DplLoginController extends ControllerBase {
  use StringTranslationTrait;

  const LOGGER_KEY = 'dpl_login';
  // @todo This could be moved to a new service
  // handling adgangsplatform configuration.
  // @see dpl_login_install() and \Drupal\dpl_library_token\LibraryTokenHandler.
  const SETTINGS_KEY = 'openid_connect.settings.adgangsplatformen';

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
   * DdplReactController constructor.
   *
   * @param \Drupal\dpl_login\UserTokensProvider $user_token_provider
   *   The Uuser token provider.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Configuration.
   */
  public function __construct(
    UserTokensProvider $user_token_provider,
    ConfigFactoryInterface $configFactory
  ) {
    $this->userTokensProvider = $user_token_provider;
    $this->settings = $configFactory
      ->get(self::SETTINGS_KEY)->get('settings');
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
      $container->get('config.factory')
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

}
