<?php

declare(strict_types=1);

namespace Drupal\dpl_go;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\dpl_lagoon\Services\LagoonRouteResolver;
use function Safe\parse_url;

/**
 * Service for getting Go site information.
 */
class GoSite {

  public function __construct(
    protected LagoonRouteResolver $lagoonRouteResolver,
    protected AccountInterface $currentUser,
  ) {}

  /**
   * Is the current request considered "the Go site".
   *
   * This is true when the current user is the Go GraphQL consumer user that the
   * React front-end uses. Which is the only user given the "rewrite go urls"
   * permission.
   */
  public function isGoSite(): bool {
    // User 1 gets all permissions, but then they'll get redirected to the Go
    // site when they visit the site as the redirect to the front page that's
    // implicit in `/` gets rewritten, so exclude them. Means that user 1 can't
    // use the Go site, but they shouldn't be able to log into it anyway.
    return $this->currentUser->hasPermission('rewrite go urls') && $this->currentUser->id() != 1;
  }

  /**
   * Get the base URL for the CMS site.
   */
  public function getCmsBaseUrl(): string {
    $mainRoute = $this->lagoonRouteResolver->getMainRoute();

    if (!$mainRoute) {
      throw new \RuntimeException('Could not determine the CMS domain.');
    }

    return $mainRoute;
  }

  /**
   * Get the base URL for the Go site.
   */
  public function getGoBaseUrl(): string {
    // If the GO_DOMAIN environment variable is set,
    // it will override anything else.
    $goDomain = getenv('GO_DOMAIN') ?: NULL;

    if ($goDomain) {
      return $goDomain;
    }

    $urlParsed = parse_url($this->getCmsBaseUrl());

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

    if (!$goDomain) {
      throw new \RuntimeException('Could not determine the Go domain.');
    }

    return $goDomain;
  }

  /**
   * Determine if the given node is a Go node.
   */
  public function isGoNode(EntityInterface $node): bool {
    return str_starts_with($node->bundle(), 'go_');
  }

}
