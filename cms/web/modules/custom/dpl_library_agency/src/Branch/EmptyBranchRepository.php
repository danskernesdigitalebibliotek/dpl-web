<?php

namespace Drupal\dpl_library_agency\Branch;

use Drupal\Core\Cache\CacheableDependencyTrait;

/**
 * A branch repository which always returns an empty set.
 */
class EmptyBranchRepository implements BranchRepositoryInterface {

  use CacheableDependencyTrait;

  /**
   * {@inheritdoc}
   */
  public function getBranches(): array {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge(): int {
    return 0;
  }

}
