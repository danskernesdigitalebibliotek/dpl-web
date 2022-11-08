<?php

namespace Drupal\dpl_library_agency\Branch;

use DanskernesDigitaleBibliotek\FBS\Api\ExternalV1AgencyidApi;
use DanskernesDigitaleBibliotek\FBS\Model\AgencyBranch;

/**
 * Retrieves agency branches from the FBS external service.
 */
class FbsBranchRepository implements BranchRepositoryInterface {

  /**
   * External branch API constructor.
   *
   * @param \DanskernesDigitaleBibliotek\FBS\Api\ExternalV1AgencyidApi $api
   *   The API instance to use to integrate with FBS.
   */
  public function __construct(
    private ExternalV1AgencyidApi $api,
  ) {}

  /**
   * {@inheritdoc}
   */
  public function getBranches(): array {
    return array_map(function (AgencyBranch $branch) {
      return new Branch($branch->getBranchId(), $branch->getTitle());
    }, $this->api->getBranches());
  }

}
