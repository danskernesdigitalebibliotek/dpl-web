<?php

namespace Drupal\dpl_go\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\dpl_go\GoSite;

/**
 * Controller for rendering full page DPL React apps.
 */
class GoController extends ControllerBase {

  /**
   * DdplReactAppsController constructor.
   */
  public function __construct(
    protected GoSite $goSite,
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

}
