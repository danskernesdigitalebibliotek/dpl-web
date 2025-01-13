<?php

namespace Drupal\bnf_server\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Redirects from the server to client side.
 */
class ServerRedirecter extends ControllerBase {

  /**
   * Redirecting to the import URL of the client site.
   *
   * @return \Drupal\Core\Routing\TrustedRedirectResponse|array<mixed>
   *   A redirect, or a notice page.
   */
  public function import(string $uuid, Request $request): TrustedRedirectResponse|array {
    $cookies = $request->cookies;
    $url = $cookies->get(LoginController::COOKIE_CALLBACK_URL);

    // If we have no URL to redirect to, we'll display a notice template,
    // with info to the user of how they can manually import the content.
    if (empty($url)) {
      return [
        '#theme' => 'bnf_server_missing_callback',
        '#uuid' => $uuid,
      ];
    }

    return new TrustedRedirectResponse("$url/admin/bnf/import/{$uuid}");
  }

}
