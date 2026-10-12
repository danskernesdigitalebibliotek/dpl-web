<?php

declare(strict_types=1);

namespace Drupal\dpl_go;

/**
 * Revalidates (drops) resources the Go front-end caches from the CMS.
 *
 * Go serves a standalone Next.js site that caches CMS data behind Next cache
 * tags and paths. An implementation knows how to reach Go's revalidate route,
 * so callers only say *what* to drop.
 */
interface GoRevalidatorInterface {

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
  public function revalidateTags(string ...$tags): bool;

  /**
   * Revalidate one or more paths (routes) in Go.
   *
   * @param string ...$paths
   *   The paths to revalidate, e.g. "/".
   *
   * @return bool
   *   TRUE if every path's request was sent; FALSE otherwise.
   */
  public function revalidatePaths(string ...$paths): bool;

}
