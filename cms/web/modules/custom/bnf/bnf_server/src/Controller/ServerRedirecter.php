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
   */
  public function import(string $uuid, Request $request): TrustedRedirectResponse {
    $cookies = $request->cookies;
    $url = $cookies->get(LoginController::COOKIE_CALLBACK_URL);

    return new TrustedRedirectResponse("$url/admin/bnf/import/{$uuid}");
  }

}
