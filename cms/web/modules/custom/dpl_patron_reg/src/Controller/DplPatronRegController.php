<?php

namespace Drupal\dpl_patron_reg\Controller;

use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\Block\BlockManagerInterface;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Render\RendererInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Url;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\dpl_login\UserTokensProviderInterface;
use Drupal\dpl_react\DplReactConfigInterface;
use Drupal\openid_connect\OpenIDConnectClaims;
use Drupal\openid_connect\OpenIDConnectSession;
use Drupal\openid_connect\Plugin\OpenIDConnectClientManager;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Patron registration Controller.
 */
class DplPatronRegController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    protected UserTokensProviderInterface $userTokensProvider,
    protected UserTokensProviderInterface $unregisteredUserTokensProvider,
    protected OpenIDConnectSession $session,
    protected OpenIDConnectClientManager $pluginManager,
    protected OpenIDConnectClaims $claims,
    protected BranchSettings $branchSettings,
    protected BranchRepositoryInterface $branchRepository,
    protected BlockManagerInterface $blockManager,
    protected RendererInterface $renderer,
    protected DplReactConfigInterface $patronRegSettings
  ) {
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): DplPatronRegController|static {
    return new static(
      $container->get('dpl_login.user_tokens'),
      $container->get('dpl_login.unregistered_user_tokens'),
      $container->get('openid_connect.session'),
      $container->get('plugin.manager.openid_connect_client'),
      $container->get('openid_connect.claims'),
      $container->get('dpl_library_agency.branch_settings'),
      $container->get('dpl_library_agency.branch.repository'),
      $container->get('plugin.manager.block'),
      $container->get('renderer'),
      $container->get('dpl_patron_reg.settings')
    );
  }

  /**
   * Redirect callback that redirects to log in service.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Http request object.
   * @param string $client_name
   *   OpenID connect client name.
   *
   * @return \Drupal\Core\Routing\TrustedRedirectResponse
   *   Redirect response based on given client configuration.
   *
   * @throws \Drupal\Component\Plugin\Exception\PluginException
   */
  public function authRedirect(Request $request, string $client_name): TrustedRedirectResponse {
    $this->session->saveDestination();

    $configuration = $this->config('openid_connect.settings.' . $client_name)
      ->get('settings');
    /** @var \Drupal\openid_connect\Plugin\OpenIDConnectClientInterface $client */
    $client = $this->pluginManager->createInstance(
      $client_name,
      $configuration
    );
    $scopes = $this->claims->getScopes($client);
    $_SESSION['openid_connect_op'] = 'login';

    /** @var \Drupal\Core\Routing\TrustedRedirectResponse $response */
    $response = $client->authorize($scopes);

    // Set redirect Url after login. If you use the $request->getSession()
    // object this trick simply do not work and the redirect after login is
    // ignored.
    /** @var \Drupal\Core\GeneratedUrl $url */
    $url = Url::fromRoute('dpl_patron_reg.create')->toString(TRUE);
    $_SESSION['openid_connect_destination'] = $url->getGeneratedUrl();

    // Get redirect URL from OpenID connect and add forced nem-login idp into
    // the URL.
    $url = UrlHelper::parse($response->getTargetUrl());
    $url['query']['idp'] = 'nemlogin';
    $url = Url::fromUri($url['path'], ['query' => $url['query']]);
    $url->setAbsolute();
    $url = $url->toString();

    /** @var string $url */
    return new TrustedRedirectResponse($url);
  }

  /**
   * Load the user registration create user react application.
   *
   * @return mixed[]
   *   Render array with registration block.
   *
   * @throws \Drupal\Component\Plugin\Exception\PluginException
   */
  public function userRegistrationReactAppLoad(): array {
    /** @var \Drupal\dpl_patron_reg\Plugin\Block\PatronRegistrationBlock $plugin_block */
    $plugin_block = $this->blockManager->createInstance('dpl_patron_reg_block', []);

    // @todo create service for access check.
    // Some blocks might implement access check.
    $access_result = $plugin_block->access($this->currentUser());
    if (is_object($access_result) && $access_result->isForbidden() || is_bool($access_result) && !$access_result) {
      throw new AccessDeniedHttpException();
    }

    // Add the cache tags/contexts.
    $render = $plugin_block->build();
    $this->renderer->addCacheableDependency($render, $plugin_block);
    $this->renderer->addCacheableDependency($render, $this->patronRegSettings);

    return $render;
  }

  /**
   * Make sure that user is detected as registered after registration.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Symfony request object.
   *
   * @return \Symfony\Component\HttpFoundation\RedirectResponse
   *   A redirect to the authorization endpoint.
   */
  public function postRegister(Request $request): RedirectResponse {
    $access_token = $this->unregisteredUserTokensProvider->getAccessToken();
    $logger = $this->getLogger('dpl_patron_reg');

    // Swap unregistered user token with registered user token.
    if ($access_token && _dpl_login_delete_previous_user_tokens()) {
      $logger->info('Post register - Previous user tokens were deleted.');
      $this->userTokensProvider->setAccessToken($access_token);
      $logger->info('Post register - User token was set.');
    }
    else {
      $logger->error('Post register - Unable to delete previous user tokens.');
    }

    // Default redirect path to dashboard.
    $redirect_path = dpl_react_apps_ensure_url_is_string(
      Url::fromRoute('dpl_dashboard.list')->toString()
    );

    // Otherwise if specified, redirect to the current path.
    if ($current_path = $request->query->get('current-path')) {
      $redirect_path = $current_path;
    }

    return new RedirectResponse((string) $redirect_path);
  }

}
