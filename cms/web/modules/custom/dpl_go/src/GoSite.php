<?php

declare(strict_types=1);

namespace Drupal\dpl_go;

use Drupal\dpl_lagoon\Services\LagoonRouteResolver;
use function Safe\parse_url;

/**
 * Service for getting Go site information.
 */
class GoSite {

  public function __construct(protected LagoonRouteResolver $lagoonRouteResolver) {}

  /**
   * Get the base URL for the Go site.
   */
  public function getGoBaseUrl(): string {
    // If the GO_DOMAIN environment variable is set,
    // it will override anything else.
    if ($goDomain = getenv('GO_DOMAIN') ?: NULL) {
      return $goDomain;
    }

    if ($mainRoute = $this->lagoonRouteResolver->getMainRoute()) {
      $urlParsed = parse_url($mainRoute);

      // These two parts are required.
      if (isset($urlParsed['scheme']) || isset($urlParsed['host'])) {
        $host = $urlParsed['host'];

        if (str_starts_with($host, 'www.')) {
          $host = str_replace('www.', 'www.go.', $host);
        }
        else {
          $host = "go.{$host}";
        }

        $goDomain = sprintf('%s://%s%s', $urlParsed['scheme'], $host, $urlParsed['path'] ?? '');
      }
    }

    if (!$goDomain) {
      throw new \RuntimeException('Could not determine the Go domain.');
    }

    return $goDomain;
  }

}
