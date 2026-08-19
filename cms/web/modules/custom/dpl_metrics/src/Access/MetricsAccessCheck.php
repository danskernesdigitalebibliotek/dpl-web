<?php

declare(strict_types=1);

namespace Drupal\dpl_metrics\Access;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Access\AccessResultInterface;
use Drupal\Core\Routing\Access\AccessInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Site\Settings;
use Symfony\Component\HttpFoundation\Request;

/**
 * Controls access to the metrics endpoint.
 *
 * The endpoint reveals traffic patterns and can be used to fingerprint a
 * deployment, so it is closed unless a scrape token has been configured. That
 * ordering matters for a distribution: a site that installs the module without
 * finishing the setup gets a 403, not an open endpoint.
 */
class MetricsAccessCheck implements AccessInterface {

  /**
   * Header carrying the scrape token.
   *
   * Prometheus sets this via authorization/bearer_token in its scrape config.
   */
  private const TOKEN_HEADER = 'Authorization';

  /**
   * Scheme prefixing the token in that header.
   */
  private const TOKEN_SCHEME = 'Bearer ';

  /**
   * Checks whether the request may read metrics.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The incoming request.
   * @param \Drupal\Core\Session\AccountInterface $account
   *   The account making the request.
   *
   * @return \Drupal\Core\Access\AccessResultInterface
   *   Allowed for a valid scrape token, or for an account holding the
   *   permission. Forbidden otherwise.
   */
  public function access(Request $request, AccountInterface $account): AccessResultInterface {
    // Never cache the decision: it turns on a request header, and a cached
    // "allowed" would hand the endpoint to everyone.
    $configured = Settings::get('dpl_metrics.token');

    if (is_string($configured) && $configured !== '' && $this->tokenMatches($request, $configured)) {
      return AccessResult::allowed()->setCacheMaxAge(0);
    }

    // Lets an administrator inspect the endpoint in a browser, and gives
    // in-cluster scrapers an alternative to the token if a site prefers roles.
    return AccessResult::allowedIfHasPermission($account, 'access dpl metrics')
      ->setCacheMaxAge(0);
  }

  /**
   * Compares the presented token against the configured one.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The incoming request.
   * @param string $configured
   *   The expected token.
   *
   * @return bool
   *   TRUE when the request carries the right token.
   */
  private function tokenMatches(Request $request, string $configured): bool {
    $header = trim($request->headers->get(self::TOKEN_HEADER, '') ?? '');

    if ($header === '') {
      return FALSE;
    }

    // Accept the token bare as well as behind the scheme Prometheus sends.
    $presented = stripos($header, self::TOKEN_SCHEME) === 0
      ? trim(substr($header, strlen(self::TOKEN_SCHEME)))
      : $header;

    // Constant time, so that a wrong token cannot be narrowed down by timing.
    return hash_equals($configured, $presented);
  }

}
