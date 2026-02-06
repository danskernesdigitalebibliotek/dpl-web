<?php

namespace Drupal\dpl_library_agency;

use Drupal\Core\Cache\CacheableDependencyInterface;
use Drupal\Core\Config\Config;
use Drupal\Core\Config\ConfigManagerInterface;

/**
 * Object for managing branch related settings.
 */
class BranchSettings implements CacheableDependencyInterface {
  public const EXCLUDED_RESERVATION_BRANCHES = [];
  public const EXCLUDED_SEARCH_BRANCHES = [];
  public const EXCLUDED_AVAILABILITY_BRANCHES = [];

  /**
   * The name of the configuration entry containing the settings.
   *
   * @var string
   */
  protected const CONFIG_NAME = 'dpl_library_agency.general_settings.branches';

  /**
   * The configuration key for reservation branches.
   *
   * @var string
   */
  protected const RESERVATION_KEY = 'reservation';

  /**
   * The configuration key for search branches.
   *
   * @var string
   */
  protected const SEARCH_KEY = 'search';

  /**
   * The configuration key for availability branches.
   *
   * @var string
   */
  protected const AVAILABILITY_KEY = 'availability';

  /**
   * Constructor.
   *
   * @param \Drupal\Core\Config\ConfigManagerInterface $config
   *   The configuration manager containing all configuration.
   */
  public function __construct(
    protected ConfigManagerInterface $config,
  ) {}

  /**
   * Get the configuration entry responsible branches.
   */
  protected function getBranchConfig() : Config {
    return $this->config->getConfigFactory()->getEditable(self::CONFIG_NAME);
  }

  /**
   * Get the branches where patrons cannot pick up reservations.
   *
   * @return string[]
   *   The ids of the excluded branches.
   */
  public function getExcludedReservationBranches() : array {
    return $this->getBranchConfig()->get(self::RESERVATION_KEY) ?? self::EXCLUDED_RESERVATION_BRANCHES;
  }

  /**
   * Set the branches where patrons cannot pick up reservations.
   *
   * @param string[] $branchIds
   *   The ids of the excluded branches.
   */
  public function setExcludedReservationBranches(array $branchIds): void {
    $this->getBranchConfig()->set(self::RESERVATION_KEY, $branchIds)->save();
  }

  /**
   * Get the branches whose materials should not be displayed in search results.
   *
   * @return string[]
   *   The ids of the excluded branches.
   */
  public function getExcludedSearchBranches(): array {
    return $this->getBranchConfig()->get(self::SEARCH_KEY) ?? self::EXCLUDED_SEARCH_BRANCHES;
  }

  /**
   * Set the branches whose materials should not be displayed in search results.
   *
   * @param string[] $branchIds
   *   The ids of the excluded branches.
   */
  public function setExcludedSearchBranches(array $branchIds): void {
    $this->getBranchConfig()->set(self::SEARCH_KEY, $branchIds)->save();
  }

  /**
   * Get the branches whose materials should not be considered for availability.
   *
   * @return string[]
   *   The ids of the excluded branches.
   */
  public function getExcludedAvailabilityBranches(): array {
    return $this->getBranchConfig()->get(self::AVAILABILITY_KEY) ?? self::EXCLUDED_AVAILABILITY_BRANCHES;
  }

  /**
   * Set the branches whose materials should not be considered for availability.
   *
   * @param string[] $branchIds
   *   The ids of the excluded branches.
   */
  public function setExcludedAvailabilityBranches(array $branchIds): void {
    $this->getBranchConfig()->set(self::AVAILABILITY_KEY, $branchIds)->save();
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheContexts() : array {
    return $this->getBranchConfig()->getCacheContexts();
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheTags() : array {
    return $this->getBranchConfig()->getCacheTags();
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() : int {
    return $this->getBranchConfig()->getCacheMaxAge();
  }

}
