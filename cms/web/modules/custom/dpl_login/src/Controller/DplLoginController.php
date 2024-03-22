<?php

namespace Drupal\dpl_login\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\Url;
use Drupal\dpl_login\AccessToken;
use Drupal\dpl_login\Adgangsplatformen\Config;
use Drupal\dpl_login\Exception\MissingConfigurationException;
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
   * {@inheritdoc}
   */
  public function __construct(
    protected UserTokensProviderInterface $userTokensProvider,
    protected UserTokensProviderInterface $unregisteredUserTokensProvider,
    protected Config $config,
    protected OpenIDConnectClientInterface $client,
    protected OpenIDConnectClaims $claims
  ) {}

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
      $container->get('openid_connect.claims')
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

    $access_token = $this->getAccessToken();

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
   * Retrieve current path parameter, generate new URL and store
   * it in session for later redirect and authorize user.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Symfony request object.
   *
   * @return \Symfony\Component\HttpFoundation\Response
   *   A redirect to the authorization endpoint.
   */
  public function login(Request $request): Response {
    $_SESSION['openid_connect_op'] = 'login';

    $url = Url::fromRoute('dpl_login.login_handler');

    if ($current_path = $request->query->get('current-path')) {
      $url->mergeOptions(['query' => ['current-path' => $current_path]]);

    }
    $generated_url = $url->toString(TRUE);
    $_SESSION['openid_connect_destination'] = $generated_url->getGeneratedUrl();

    $scopes = $this->claims->getScopes($this->client);
    return $this->client->authorize($scopes);
  }

  /**
   * Check if a user token has been set and decide redirection.
   *
   * Check if a user token has been set and either allow redirecting
   * to the original path or redirect to frontpage.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Symfony request object.
   *
   * @return \Drupal\Core\Routing\TrustedRedirectResponse
   *   A redirect to either the original redirect or to the frontpage.
   */
  public function loginHandler(Request $request): TrustedRedirectResponse {
    if ($this->getAccessToken() && $current_path = (string) $request->query->get('current-path')) {
      $url = Url::fromUri('internal:/' . ltrim($current_path, '/'))->toString(TRUE);
      return new TrustedRedirectResponse($url->getGeneratedUrl());
    }

    $url = Url::fromRoute('<front>', [], ["absolute" => TRUE])->toString(TRUE);
    return new TrustedRedirectResponse($url->getGeneratedUrl());
  }

  /**
   * Get access token. If user is not registered, get unregistered user token.
   *
   * @todo Should be moved to separate service that can be used througut the application.
   */
  protected function getAccessToken(): ?AccessToken {
    if ($access_token = $this->unregisteredUserTokensProvider->getAccessToken()) {
      return $access_token;
    }
    if ($access_token = $this->userTokensProvider->getAccessToken()) {
      return $access_token;
    }

    return NULL;
  }

}
