<?php

declare(strict_types=1);

namespace Drupal\dpl_login\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Routing\LocalRedirectResponse;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\Url;
use Drupal\dpl_login\Adgangsplatformen\Config;
use Drupal\dpl_login\Exception\MissingConfigurationException;
use Drupal\dpl_login\UserTokens;
use Drupal\openid_connect\OpenIDConnectClaims;
use Drupal\openid_connect\OpenIDConnectSessionInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * DPL React Controller.
 */
class DplLoginController extends ControllerBase {

  use StringTranslationTrait;

  /**
   * OpenID connect client storage.
   */
  protected EntityStorageInterface $clientStorage;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    protected UserTokens $userTokens,
    protected Config $config,
    protected OpenIDConnectClaims $claims,
    protected OpenIDConnectSessionInterface $session,
  ) {
    $this->clientStorage = $this->entityTypeManager()->getStorage('openid_connect_client');
  }

  /**
   * Logs out user externally and internally.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Symfony request object.
   *
   * @return \Drupal\Core\Routing\TrustedRedirectResponse|\Symfony\Component\HttpFoundation\RedirectResponse
   *   Redirect to external logout service or front if not possible.
   *
   * @throws \Drupal\dpl_login\Exception\MissingConfigurationException
   */
  public function logout(Request $request): TrustedRedirectResponse|RedirectResponse {
    // It is a global problem if the logout endpoint has not been configured.
    if (!$logout_endpoint = $this->config->getLogoutEndpoint()) {
      throw new MissingConfigurationException('Adgangsplatformen plugin config variable logout_endpoint is missing');
    }

    $access_token = $this->userTokens->getCurrent();
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

    if ($current_path = (string) $request->query->get('current-path')) {
      $redirect_uri = Url::fromUri(sprintf('internal:%s', $current_path), ['absolute' => TRUE])
        ->toString(TRUE)
        ->getGeneratedUrl();
    }

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
    // Ideally the /login route shouldn't be available to logged in users, but
    // seem to get a lot of unexplained "Already logged in" exceptions in the
    // logs which means that people manage to go through login only to get an
    // error because there's already a user logged in. So to use a softer
    // approach, we just log them out of Drupal, if they're still logged into
    // Adgangsplatformen they'll just get redirected right back and logged in
    // again. We'll log the referrer to try and figure out how this happens.
    if ($this->currentUser()->isAuthenticated()) {
      $this->getLogger('dpl_login')->warning('Authenticated user hit /login, referrer: %referer', [
        'referer' => $request->headers->get('referer') ?? "unknown",
      ]);

      user_logout();

      // As we just nuked the session above, trying to save `current-path` in
      // session isn't going to work, so redirect to ourselves to get a fresh
      // session.
      return new LocalRedirectResponse($request->getUri());
    }

    $this->session->saveOp('login');
    if ($current_path = (string) $request->query->get('current-path')) {
      $this->session->saveTargetLinkUri($current_path);
    }

    $client_name = 'adgangsplatformen';
    /** @var null|\Drupal\openid_connect\OpenIDConnectClientEntityInterface $client */
    $client = $this->clientStorage->load($client_name);

    if (!$client) {
      throw new \RuntimeException("No {$client_name} openid_connect client");
    }

    $plugin = $client->getPlugin();
    $scopes = $this->claims->getScopes($plugin);
    return $plugin->authorize($scopes);
  }

}
