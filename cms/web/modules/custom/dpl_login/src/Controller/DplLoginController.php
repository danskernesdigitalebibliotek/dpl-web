<?php

declare(strict_types=1);

namespace Drupal\dpl_login\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Routing\LocalRedirectResponse;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\Url;
use Drupal\dpl_login\AccessToken;
use Drupal\dpl_login\AccessTokenType;
use Drupal\dpl_login\Adgangsplatformen\Config;
use Drupal\dpl_login\Exception\MissingConfigurationException;
use Drupal\dpl_login\Unilogin;
use Drupal\dpl_login\User;
use Drupal\dpl_login\UserTokens;
use Drupal\openid_connect\OpenIDConnectClaims;
use Drupal\openid_connect\OpenIDConnectSessionInterface;
use Drupal\dpl_login\AuthenticationType;
use Drupal\dpl_login\DplLoginSession;
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
    protected UserTokens $userTokens,
    protected Config $config,
    protected OpenIDConnectClaims $claims,
    protected OpenIDConnectSessionInterface $session,
    protected User $user,
    protected DplLoginSession $dplLoginSession,
  ) {}

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
    $this->user->logout();

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
    elseif ($this->moduleHandler()->moduleExists('dpl_go')) {
      // The Adgangsplatformen session is shared with the Go site, but the Go
      // session cookie lives on the Go host where the CMS cannot clear it.
      // Logouts initiated on the CMS site (no current-path) detour through
      // Go so it can destroy its own session before landing the user on the
      // front page. Go-initiated logouts pass current-path and have already
      // destroyed the Go session.
      $redirect_uri = Url::fromRoute('dpl_go.post_cms_logout', [], ['absolute' => TRUE])
        ->toString(TRUE)
        ->getGeneratedUrl();
    }

    return $this->singleLogoutResponse($logout_endpoint, $access_token, $redirect_uri);
  }

  /**
   * Send the user to the Adgangsplatformen single logout.
   *
   * @param string $logout_endpoint
   *   The Adgangsplatformen logout endpoint.
   * @param \Drupal\dpl_login\AccessToken $access_token
   *   The token of the session to end.
   * @param string $redirect_uri
   *   Where Adgangsplatformen sends the user afterwards.
   *
   * @return \Drupal\Core\Routing\TrustedRedirectResponse
   *   A redirect to the single logout.
   */
  protected function singleLogoutResponse(string $logout_endpoint, AccessToken $access_token, string $redirect_uri): TrustedRedirectResponse {
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

      $access_token = $this->userTokens->getCurrent();
      $this->user->logout();

      // A Unilogin student is logged in without being a patron, and gets here
      // when starting a patron login, e.g. to make a reservation. Log the
      // student out of Adgangsplatformen as well and come back here, so a
      // cancelled patron login does not leave the student half logged in.
      if ($access_token?->type === AccessTokenType::UniloginUser
        && $request->query->get('idp') !== Unilogin::IDP
        && ($logout_endpoint = $this->config->getLogoutEndpoint())) {
        return $this->singleLogoutResponse($logout_endpoint, $access_token, $request->getUri());
      }

      // As we just nuked the session above, trying to save `current-path` in
      // session isn't going to work, so redirect to ourselves to get a fresh
      // session.
      return new LocalRedirectResponse($request->getUri());
    }

    $this->session->saveOp('login');
    if ($current_path = (string) $request->query->get('current-path')) {
      $this->session->saveTargetLinkUri($current_path);
    }

    // Set the authentication type in session. We use this later to
    // distinguish between login and registration.
    $this->dplLoginSession->setAuthenticationType(AuthenticationType::Login);

    // Only allow-listed identity providers can be forced. Unilogin logins are
    // recognised by their claims later on, the flag is a fallback.
    $is_unilogin = $request->query->get('idp') === Unilogin::IDP;
    $this->dplLoginSession->setUniloginLogin($is_unilogin);
    $additional_params = $is_unilogin ? ['idp' => Unilogin::ADGANGSPLATFORMEN_IDP] : [];

    $client_name = 'adgangsplatformen';
    /** @var null|\Drupal\openid_connect\OpenIDConnectClientEntityInterface $client */
    $client = $this->entityTypeManager()->getStorage('openid_connect_client')->load($client_name);

    if (!$client) {
      throw new \RuntimeException("No {$client_name} openid_connect client");
    }

    $plugin = $client->getPlugin();
    $scopes = $this->claims->getScopes($plugin);
    return $plugin->authorize($scopes, $additional_params);
  }

}
