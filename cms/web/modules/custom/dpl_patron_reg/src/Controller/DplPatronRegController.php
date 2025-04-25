<?php

namespace Drupal\dpl_patron_reg\Controller;

use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Url;
use Drupal\openid_connect\OpenIDConnectClaims;
use Drupal\openid_connect\OpenIDConnectSessionInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Patron registration Controller.
 */
class DplPatronRegController extends ControllerBase {

  /**
   * OpenID connect client storage.
   */
  protected EntityStorageInterface $clientStorage;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    protected OpenIDConnectSessionInterface $session,
    protected OpenIDConnectClaims $claims,
  ) {
    $this->clientStorage = $this->entityTypeManager()->getStorage('openid_connect_client');
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
    // If we're logged in, logout the current user, else openid_connect will
    // throw an exception on return.
    if ($this->currentUser()->isAuthenticated()) {
      user_logout();
    }

    $this->session->saveDestination();

    /** @var null|\Drupal\openid_connect\OpenIDConnectClientEntityInterface $client */
    $client = $this->clientStorage->load($client_name);

    if (!$client) {
      throw new \RuntimeException("No {$client_name} openid_connect client");
    }

    $plugin = $client->getPlugin();
    $scopes = $this->claims->getScopes($plugin);
    $this->session->saveOp('login');

    /** @var \Drupal\Core\Routing\TrustedRedirectResponse $response */
    $response = $plugin->authorize($scopes);

    // Set redirect Url after login. If you use the $request->getSession()
    // object this trick simply do not work and the redirect after login is
    // ignored.
    /** @var \Drupal\Core\GeneratedUrl $url */
    $url = Url::fromRoute('dpl_patron_reg.create')->toString(TRUE);
    $this->session->saveTargetLinkUri($url->getGeneratedUrl());

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

}
