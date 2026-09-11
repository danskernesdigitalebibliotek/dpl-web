<?php

namespace Drupal\dpl_go\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\dpl_go\GoSiteInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * Controller for rendering full page DPL React apps.
 */
class GoController extends ControllerBase {

  /**
   * DdplReactAppsController constructor.
   */
  public function __construct(
    protected GoSiteInterface $goSite,
  ) {}

  /**
   * Redirects back to the external Go app after successful login.
   */
  public function postAdgangsplatformenLoginRoute(): TrustedRedirectResponse {
    // @todo We should make it configurable which path to redirect to.
    $externalGoUrl = sprintf('%s/auth/callback/adgangsplatformen', $this->goSite->getGoBaseUrl());
    $response = new TrustedRedirectResponse($externalGoUrl);

    return $response;
  }

  /**
   * Redirects back to the external Go app after successful logout.
   */
  public function postAdgangsplatformenLogoutRoute(): TrustedRedirectResponse {
    // @todo We should make it configurable which path to redirect to.
    $response = new TrustedRedirectResponse($this->goSite->getGoBaseUrl());

    return $response;
  }

  /**
   * Sends the browser through the Go app to clear its session after logout.
   *
   * The Go session cookie lives on the Go host, so the CMS cannot clear it
   * itself. The Go endpoint destroys the session and redirects the user back
   * to the CMS front page.
   */
  public function postCmsLogoutRoute(): TrustedRedirectResponse|RedirectResponse {
    try {
      $goLogoutUrl = sprintf('%s/auth/logout/cms', $this->goSite->getGoBaseUrl());
    }
    catch (\RuntimeException) {
      // If the Go domain cannot be determined the user must still complete
      // the logout — land on the front page as before.
      return $this->redirect('<front>');
    }

    return new TrustedRedirectResponse($goLogoutUrl);
  }

}
