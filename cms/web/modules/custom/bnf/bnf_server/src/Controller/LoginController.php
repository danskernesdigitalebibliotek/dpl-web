<?php

namespace Drupal\bnf_server\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Recieving "login" information, used to display "import to my site" button.
 *
 * This endpoint is reached from library websites, when submitting the login
 * form. It has data for where the user is coming from, so we can display
 * a button for importing content.
 */
class LoginController extends ControllerBase {
  const COOKIE_CALLBACK_URL = 'bnf_server_login_callback_url';
  const COOKIE_SITE_NAME = 'bnf_server_login_site_name';

  /**
   * Receiving the login.
   */
  public function login(Request $request): RedirectResponse {
    $queries = $request->query;
    $url = (string) $queries->get('callbackUrl');
    $name = (string) $queries->get('siteName');

    if (empty($url)) {
      throw new BadRequestHttpException('Callback URL cannot be empty.');
    }

    $response = new RedirectResponse('/');

    $response->headers->setCookie(new Cookie(self::COOKIE_CALLBACK_URL, $url));
    $response->headers->setCookie(new Cookie(self::COOKIE_SITE_NAME, $name));

    return $response;
  }

}
