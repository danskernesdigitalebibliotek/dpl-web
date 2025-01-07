<?php

namespace Drupal\bnf_client\Controller;

use Drupal\Core\Controller\ControllerBase;

use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Url;
use Symfony\Component\HttpFoundation\Request;

/**
 * Redirecting the editor to BNF.
 */
class BnfRedirecter extends ControllerBase {

  /**
   * Logging in the editor on BNF, allowing them to browse available content.
   */
  public function login(Request $request): TrustedRedirectResponse {
    $bnfServer = (string) getenv('BNF_SERVER_BASE_ENDPOINT');
    $loginUrl = "$bnfServer/bnf/login";

    $url = Url::fromUri($loginUrl, [
      'query' => [
        'siteName' => $this->config('system.site')->get('name'),
        'callbackUrl' => $request->getSchemeAndHttpHost(),
      ],
    ]);

    $url->setAbsolute();

    return new TrustedRedirectResponse($url->toString());
  }

}
