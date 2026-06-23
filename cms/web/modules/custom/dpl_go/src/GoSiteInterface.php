<?php

declare(strict_types=1);

namespace Drupal\dpl_go;

use Drupal\Core\Entity\EntityInterface;

/**
 * Service for getting Go site information.
 */
interface GoSiteInterface {

  /**
   * Is the current request considered "the Go site".
   */
  public function isGoSite(): bool;

  /**
   * Check if absolute URLs should be used for all content.
   */
  public function useAbsoluteUrls(): bool;

  /**
   * Get the base URL for the CMS site.
   */
  public function getCmsBaseUrl(): string;

  /**
   * Get the base URL for the Go site.
   */
  public function getGoBaseUrl(): string;

  /**
   * Determine if the given node is a Go node.
   */
  public function isGoNode(EntityInterface $node): bool;

  /**
   * Determine if the given nid is a Go node.
   */
  public function isGoNid(string $nid): ?bool;

}
