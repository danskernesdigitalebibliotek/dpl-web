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

  public function informationPage(): array {
    $config = $this->config('dpl_patron_reg.settings');
    $logins = [];

    $definitions = $this->pluginManager->getDefinitions();
    foreach ($definitions as $client_id => $client) {
      if (!$this->config('openid_connect.settings.' . $client_id)
        ->get('enabled')) {
        continue;
      }

      $url = Url::fromRoute('dpl_patron_reg.auth', ['client_name' => $client_id], ['absolute' => TRUE, 'query' => ['destination' => '/user/me']]);
      $link = Link::fromTextAndUrl($this->t('Log in with @client_title', [
        '@client_title' => $client['label'],
      ]), $url);
      $logins[$client_id] = $link->toRenderable();
    }

    $t=1;
    return [
      'info' => [
        '#type' => 'processed_text',
        '#text' => $config->get('information')['value'] ?? 'Please fill out the information page in the administration',
        '#format' => $config->get('information')['format'] ?? 'plain_text',
      ],
      'logins' => $logins
    ];
  }

  public function auth(string $client_name) {
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

    // Get URL and add forced nemlogin idp in the request
    $url = UrlHelper::parse($response->getTargetUrl());
    $url['query']['idp'] = 'nemlogin';
    $url = Url::fromUri($url['path'], ['query' => $url['query']]);
    $url->setAbsolute(true);

    return new TrustedRedirectResponse($url->toString());
  }

}
