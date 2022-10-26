<?php

namespace Drupal\dpl_library_agency\Branch;

/**
 * Build an array of branches from an array of ids.
 *
 * This can be used if we for some reason do not have a full set of branch data
 * available.
 */
class IdBranchRepository implements BranchRepositoryInterface {

  /**
   * Constructor.
   *
   * @param string[] $ids
   *   The branch ids.
   */
  public function __construct(
    protected array $ids,
  ) {}

  /**
   * {@inheritdoc}
   */
  public function getBranches(): array {
    return array_map(function (string $id) {
      return new Branch($id, $id);
    }, $this->ids);
  }

}
