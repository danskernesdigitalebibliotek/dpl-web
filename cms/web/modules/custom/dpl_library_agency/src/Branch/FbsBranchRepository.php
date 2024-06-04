<?php

namespace Drupal\dpl_library_agency\Branch;

use DanskernesDigitaleBibliotek\FBS\Model\AgencyBranch;
use Drupal\dpl_fbs\FbsApiFactory;
use Drupal\dpl_library_token\LibraryTokenHandler;

/**
 * Retrieves agency branches from the FBS external service.
 */
class FbsBranchRepository implements BranchRepositoryInterface {

  /**
   * External branch API constructor.
   *
   * @param \Drupal\dpl_fbs\FbsApiFactory $apiFactory
   *   API factory to setup the agency API.
   * @param \Drupal\dpl_library_token\LibraryTokenHandler $tokenHandler
   *   The token handler to use to retrieve the library token.
   */
  public function __construct(
    private FbsApiFactory $apiFactory,
    private LibraryTokenHandler $tokenHandler,
  ) {
  }

  /**
   * {@inheritdoc}
   *
   * @throws \DanskernesDigitaleBibliotek\FBS\ApiException
   */
  public function getBranches(): array {
    // Use an empty token if we don't have one. This may cause the API to throw
    // an exception, but that is acceptable.
    $api = $this->apiFactory->getAgencyApi($this->tokenHandler->getToken() ?? '');
    return array_map(function (AgencyBranch $branch) {
      return new Branch($branch->getBranchId(), $branch->getTitle());
    }, $api->getBranches());
  }

}
