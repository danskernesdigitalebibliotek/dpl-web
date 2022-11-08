<?php

namespace Drupal\dpl_library_agency\Branch;

/**
 * Retrieves agency branches.
 */
interface BranchRepositoryInterface {

  /**
   * Retrieve agency branches.
   *
   * @return Branch[]
   *   Agency branches
   */
  public function getBranches(): array;

}
