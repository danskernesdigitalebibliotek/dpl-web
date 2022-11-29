<?php

namespace Drupal\dpl_library_agency\Branch;

use Psr\Log\LoggerInterface;

/**
 * Repository with a fallback option.
 *
 * If an error/exception occurs when retrieving branches from one repository
 * this will fall back to a secondary option.
 */
class FallbackBranchRepository implements BranchRepositoryInterface {

  /**
   * Constructor.
   */
  public function __construct(
    private BranchRepositoryInterface $primaryRepository,
    private BranchRepositoryInterface $secondaryRepository,
    private LoggerInterface $logger
  ) {}

  /**
   * {@inheritdoc}
   */
  public function getBranches(): array {
    try {
      return $this->primaryRepository->getBranches();
    }
    catch (\Exception $e) {
      $this->logger->warning('Unable to retrieve branches from %primary: %message. Falling back to %secondary',
        [
          '%primary' => $this->primaryRepository::class,
          '%message' => $e->getMessage(),
          '%secondary' => $this->secondaryRepository::class,
        ]);
      return $this->secondaryRepository->getBranches();
    }
  }

}
