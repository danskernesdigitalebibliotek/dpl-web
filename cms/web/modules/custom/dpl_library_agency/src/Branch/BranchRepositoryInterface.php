<?php

namespace Drupal\dpl_library_agency\Branch;

use Drupal\Core\Cache\CacheableDependencyInterface;

/**
 * Retrieves agency branches.
 */
interface BranchRepositoryInterface extends CacheableDependencyInterface {

  /**
   * Retrieve agency branches.
   *
   * @return Branch[]
   *   Agency branches
   */
  public function getBranches(): array;

}
