<?php

namespace Drupal\dpl_library_agency\Branch;

/**
 * A branch repository which always returns an empty set.
 */
class EmptyBranchRepository implements BranchRepositoryInterface {

  /**
   * {@inheritdoc}
   */
  public function getBranches(): array {
    return [];
  }

}
