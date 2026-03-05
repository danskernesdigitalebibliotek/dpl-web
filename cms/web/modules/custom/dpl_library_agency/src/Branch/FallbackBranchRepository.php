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
   * The repository that was last used to retrieve branches.
   */
  private BranchRepositoryInterface $usedRepository;

  /**
   * Constructor.
   */
  public function __construct(
    private BranchRepositoryInterface $primaryRepository,
    private BranchRepositoryInterface $secondaryRepository,
    private LoggerInterface $logger,
  ) {
    $this->usedRepository = $primaryRepository;
  }

  /**
   * {@inheritdoc}
   */
  public function getBranches(): array {
    try {
      $branches = $this->primaryRepository->getBranches();
      $this->usedRepository = $this->primaryRepository;
      return $branches;
    }
    catch (\Exception $e) {
      $this->logger->warning('Unable to retrieve branches from %primary: %message. Falling back to %secondary',
        [
          '%primary' => $this->primaryRepository::class,
          '%message' => $e->getMessage(),
          '%secondary' => $this->secondaryRepository::class,
        ]);
      $this->usedRepository = $this->secondaryRepository;
      return $this->secondaryRepository->getBranches();
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheContexts(): array {
    return $this->usedRepository->getCacheContexts();
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheTags(): array {
    return $this->usedRepository->getCacheTags();
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge(): int {
    return $this->usedRepository->getCacheMaxAge();
  }

}
