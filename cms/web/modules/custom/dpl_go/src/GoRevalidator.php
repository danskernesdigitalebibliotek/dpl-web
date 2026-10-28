<?php

declare(strict_types=1);

namespace Drupal\dpl_go;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\next\Entity\NextSiteInterface;
use GuzzleHttp\ClientInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Tells the Go front-end to drop cached resources it reads from the CMS.
 *
 * Wraps Go's /cache/revalidate route: it loads the "go" next_site for the
 * revalidate url and shared secret, sends the request, and swallows failures,
 * so any CMS code can drop a Go cache tag or path without repeating that
 * plumbing. Go self-heals when its cache TTL expires, so a failed ping is
 * logged, never fatal.
 */
class GoRevalidator {

  /**
   * Go cache tag covering every cached CMS content page.
   *
   * Contract with Go, which tags each cached page with this (see the "caching"
   * resolver in go/lib/config/resolvers/caching.ts).
   */
  public const CONTENT_CACHE_TAG = 'dpl-cms-content';

  /**
   * Go cache tag covering the cached goConfiguration.
   *
   * Contract with Go, which tags its cached configuration with this.
   */
  public const CONFIG_CACHE_TAG = 'dpl-cms-config';

  public function __construct(
    #[Autowire(service: 'http_client')]
    protected ClientInterface $httpClient,
    protected EntityTypeManagerInterface $entityTypeManager,
    #[Autowire(service: 'logger.factory')]
    protected LoggerChannelFactoryInterface $loggerFactory,
  ) {}

  /**
   * Drop one or more Next cache tags in Go.
   *
   * @param string ...$tags
   *   The cache tags to drop, e.g. "dpl-cms-config".
   *
   * @return bool
   *   TRUE if a revalidation request was sent; FALSE when there is nothing to
   *   do or Go is not reachable/configured.
   */
  public function revalidateTags(string ...$tags): bool {
    $tags = array_values(array_filter($tags));
    if (!$tags) {
      return FALSE;
    }

    return $this->send(['tags' => implode(',', $tags)]);
  }

  /**
   * Revalidate one or more paths (routes) in Go.
   *
   * @param string ...$paths
   *   The paths to revalidate, e.g. "/".
   *
   * @return bool
   *   TRUE if every path's request was sent; FALSE otherwise.
   */
  public function revalidatePaths(string ...$paths): bool {
    $paths = array_values(array_filter($paths));
    if (!$paths) {
      return FALSE;
    }

    // Go's revalidate route takes a single path per call, so send one each.
    $sent = TRUE;
    foreach ($paths as $path) {
      $sent = $this->send(['path' => $path]) && $sent;
    }

    return $sent;
  }

  /**
   * Drop Go's entire Next cache of CMS-driven content.
   *
   * Clears the two umbrella cache tags every CMS-driven entry in Go carries:
   * "dpl-cms-content" (every cached page) and "dpl-cms-config" (the
   * goConfiguration). Go's "use cache" entries can only be dropped by tag - a
   * path revalidation does not touch them - so these two tags are what a full
   * manual purge needs. Prefer the targeted revalidateTags()/revalidatePaths()
   * when you know what changed.
   *
   * @return bool
   *   TRUE if a revalidation request was sent; FALSE when Go is not
   *   reachable/configured.
   */
  public function revalidateEverything(): bool {
    return $this->revalidateTags(self::CONTENT_CACHE_TAG, self::CONFIG_CACHE_TAG);
  }

  /**
   * Send a revalidation request to Go's cache route.
   *
   * @param array<string, string> $query
   *   The revalidation query - a "tags" or "path" entry. The shared secret is
   *   added here.
   *
   * @return bool
   *   TRUE if the request was sent; FALSE when Go is not configured or the
   *   request failed.
   */
  protected function send(array $query): bool {
    try {
      $site = $this->entityTypeManager->getStorage('next_site')->load('go');
      if (!$site instanceof NextSiteInterface) {
        return FALSE;
      }

      // Reuse the next module's own url construction - it adds the shared
      // secret - the same call its CacheTag and Path revalidators make.
      $url = $site->buildRevalidateUrl($query);
      if (!$url) {
        return FALSE;
      }

      $options = ['timeout' => 5];
      // Local Go (`pnpm dev:https`) serves a self-signed certificate on
      // host.docker.internal, so skip verification there. Never relaxed
      // outside local.
      if (getenv('LAGOON_ENVIRONMENT_TYPE') === 'local') {
        $options['verify'] = FALSE;
      }

      $this->httpClient->request('GET', $url->toString(), $options);

      return TRUE;
    }
    catch (\Throwable $e) {
      // Pinging Go must never break the caller (a config save, a node update,
      // …). An unreachable Go or a missing next module lands here.
      $this->loggerFactory->get('dpl_go')->warning(
        'Could not revalidate Go (@query): @message',
        [
          '@query' => http_build_query($query),
          '@message' => $e->getMessage(),
        ]
      );

      return FALSE;
    }
  }

}
