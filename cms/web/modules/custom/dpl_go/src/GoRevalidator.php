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
class GoRevalidator implements GoRevalidatorInterface {

  public function __construct(
    #[Autowire(service: 'http_client')]
    protected ClientInterface $httpClient,
    protected EntityTypeManagerInterface $entityTypeManager,
    #[Autowire(service: 'logger.factory')]
    protected LoggerChannelFactoryInterface $loggerFactory,
  ) {}

  /**
   * {@inheritdoc}
   */
  public function revalidateTags(string ...$tags): bool {
    $tags = array_values(array_filter($tags));
    if (!$tags) {
      return FALSE;
    }

    return $this->send(['tags' => implode(',', $tags)]);
  }

  /**
   * {@inheritdoc}
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

      $url = $site->getRevalidateUrl();
      $secret = $site->getRevalidateSecret();
      if (!$url || !$secret) {
        return FALSE;
      }

      $this->httpClient->request('GET', $url, [
        'query' => $query + ['secret' => $secret],
        'timeout' => 5,
      ]);

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
