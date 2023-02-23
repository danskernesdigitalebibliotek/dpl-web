<?php

namespace Drupal\dpl_patron_reg\Controller;

use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Link;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Url;
use Drupal\openid_connect\OpenIDConnectClaims;
use Drupal\openid_connect\OpenIDConnectSession;
use Drupal\openid_connect\Plugin\OpenIDConnectClientManager;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\dpl_login\UserTokensProvider;
use Symfony\Component\HttpFoundation\Request;

/**
 * Patron registration Controller.
 */
class DplPatronRegController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    protected UserTokensProvider $user_token_provider,
    protected OpenIDConnectSession $session,
    protected OpenIDConnectClientManager $pluginManager,
    protected OpenIDConnectClaims $claims
  ) {
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('dpl_login.user_tokens'),
      $container->get('openid_connect.session'),
      $container->get('plugin.manager.openid_connect_client'),
      $container->get('openid_connect.claims'),
    );
  }

  /**
   * Build and return information page as page.
   *
   * @return array
   *   The page as a render array.
   */
  public function informationPage(): array {
    $config = $this->config('dpl_patron_reg.settings');
    $logins = [];

    // Loop over all open id connect definitions and build login links for each
    // one.
    $definitions = $this->pluginManager->getDefinitions();
    foreach ($definitions as $client_id => $client) {
      if (!$this->config('openid_connect.settings.' . $client_id)
        ->get('enabled')) {
        continue;
      }

      $url = Url::fromRoute('dpl_patron_reg.auth', ['client_name' => $client_id], ['absolute' => TRUE]);
      $link = Link::fromTextAndUrl($this->t('Log in with @client_title', [
        '@client_title' => $client['label'],
      ]), $url);
      $logins[$client_id] = $link->toRenderable();
    }

    return [
      'info' => [
        '#type' => 'processed_text',
        '#text' => $config->get('information')['value'] ?? 'Please fill out the information page in the administration',
        '#format' => $config->get('information')['format'] ?? 'plain_text',
      ],
      'logins' => $logins
    ];
  }

  /**
   * Redirect callback that redirects to log in service.
   *
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
    $response = $client->authorize($scopes);

    // Get redirect URL from OpenID connect and add forced nem-login idp into
    // the URL.
    $url = UrlHelper::parse($response->getTargetUrl());
    $url['query']['idp'] = 'nemlogin';
    $url = Url::fromUri($url['path'], ['query' => $url['query']]);
    $url->setAbsolute();

    // Set redirect Url after login. If you use the $request->getSession()
    // object this trick simply do not work and the redirect after login is
    // ignored.
    $_SESSION['openid_connect_destination'] = Url::fromRoute('dpl_patron_reg.create')->toString(true)->getGeneratedUrl();

    return new TrustedRedirectResponse($url->toString());
  }

  public function userRegistrationReactAppLoad() {
    $config = $this->config('dpl_patron_reg.settings');
    $userToken = $this->user_token_provider->getAccessToken()->token;

    return [
      'placeholder' => [
        '#markup' => 'INSET REACT APP HERE',
      ],
    ];
  }

}
