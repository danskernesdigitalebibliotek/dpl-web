<?php

namespace Drupal\dpl_login\Controller;

use Drupal\Core\Url;
use Psr\Log\LogLevel;
use Drupal\dpl_login\UserTokensProvider;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\PageCache\ResponsePolicy\KillSwitch;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\dpl_login\Exception\MissingConfigurationException;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * DDB React Controller.
 */
class DplLoginController extends ControllerBase {
  use StringTranslationTrait;

  const LOGGER_KEY = 'dpl_login';
  const SETTINGS_KEY = 'openid_connect.settings.adgangsplatformen';

  /**
   * The User token provider.
   *
   * @var \Drupal\dpl_login\UserTokensProvider
   */
  protected userTokensProvider $userTokensProvider;
  /**
   * The page cache kill switch service.
   *
   * @var \Drupal\Core\PageCache\ResponsePolicy\KillSwitch
   */
  protected KillSwitch $killSwitch;
  /**
   * The logger.
   *
   * @var \Drupal\Core\Logger\LoggerChannelInterface
   */
  protected $logger;
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
   * DddbReactController constructor.
   *
   * @param \Drupal\dpl_login\UserTokensProvider $user_token_provider
   *   The Uuser token provider.
   * @param \Drupal\Core\PageCache\ResponsePolicy\KillSwitch $killSwitch
   *   The page cache kill switch service.
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $logger
   *   The DPL login logger channel.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Configuration.
   */
  public function __construct(
    UserTokensProvider $user_token_provider,
    KillSwitch $killSwitch,
    LoggerChannelFactoryInterface $logger,
    ConfigFactoryInterface $configFactory
  ) {
    $this->userTokensProvider = $user_token_provider;
    $this->killSwitch = $killSwitch;
    $this->logger = $logger->get(self::LOGGER_KEY);
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
      $container->get('page_cache_kill_switch'),
      $container->get('logger.factory'),
      $container->get('config.factory'),
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
    // We need this to prevent the redircet to be cached.
    $this->killSwitch->trigger();

    // It is a global problem if the logout endpoint has not been configured.
    if (!$logout_endpoint = $this->settings['logout_endpoint'] ?? NULL) {
      throw new MissingConfigurationException('Adgangsplatformen plugin config variable logout_endpoint is missing');
    }

    // Handle case of missing access token.
    if (!$access_token = $this->userTokensProvider->getAccessToken()) {
      $this->logger
        ->log(LogLevel::ERROR, 'Cannot logut user remotely because of missing access token');
      return $this->redirect('<front>');
    }

    // Log out user in Drupal.
    // We do this regardless wether it is possible to logout remotely or not.
    // We do not want the user to get stuck on the site in a logged in state.
    user_logout();

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
