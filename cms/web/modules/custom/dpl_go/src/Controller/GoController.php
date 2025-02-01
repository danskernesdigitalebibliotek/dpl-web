<?php

namespace Drupal\dpl_go\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\dpl_lagoon\Services\LagoonRouteResolver;
use Symfony\Component\DependencyInjection\ContainerInterface;

use function Safe\parse_url;

/**
 * Controller for rendering full page DPL React apps.
 */
class GoController extends ControllerBase {

  /**
   * DdplReactAppsController constructor.
   */
  public function __construct(
    protected LagoonRouteResolver $lagoonRouteResolver,
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
      $container->get('dpl_lagoon.host_resolver'),
    );
  }

  /**
   * Redirects back to the external Go app after successful login.
   */
  public function postAdgangsplatformenLoginRoute(): TrustedRedirectResponse {
    // @todo We should make it configurable which path to redirect to.
    $externalGoUrl = sprintf('%s/auth/callback/adgangsplatformen', $this->getGoDomain());
    $response = new TrustedRedirectResponse($externalGoUrl);

    return $response;
  }

  /**
   * Get the external Go domain.
   */
  protected function getGoDomain(): string {
    // If the GO_DOMAIN environment variable is set,
    // it will override anything else.
    if ($goDomain = getenv('GO_DOMAIN') ?: NULL) {
      return $goDomain;
    }

    if ($mainRoute = $this->lagoonRouteResolver->getMainRoute()) {
      $urlParsed = parse_url($mainRoute);
      if (!is_array($urlParsed)) {
        throw new \RuntimeException('Could not determine the Go domain.');
      }
      $goDomain = sprintf('%s://go.%s%s', $urlParsed['scheme'], $urlParsed['host'], $urlParsed['path']);
    }

    if (!$goDomain) {
      throw new \RuntimeException('Could not determine the Go domain.');
    }

    return $goDomain;
  }

}
