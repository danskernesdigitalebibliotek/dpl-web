<?php

namespace Drupal\dpl_instant_loan;

use Drupal\Core\Cache\CacheableDependencyInterface;
use Drupal\Core\Config\Config;
use Drupal\Core\Config\ConfigManagerInterface;

/**
 * Class that handles instant loan settings.
 */
class DplInstantLoanSettings implements CacheableDependencyInterface {

  const SETTINGS_KEY = 'dpl_instant_loan.settings';

  /**
   * Constructs a new DplInstantLoanSettings object.
   */
  public function __construct(
    protected ConfigManagerInterface $configManager
  ) {}

  /**
   * Get the configuration entity containing instant loan settings.
   */
  protected function getConfig(): Config {
    return $this->configManager->getConfigFactory()->get(self::SETTINGS_KEY);
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheContexts() : array {
    return $this->getConfig()->getCacheContexts();
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheTags() : array {
    return $this->getConfig()->getCacheTags();
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() : int {
    return $this->getConfig()->getCacheMaxAge();
  }

  /**
   * Get the instant loan settings.
   *
   * @return mixed[]
   *   The instant loan settings.
   */
  public function getSettings() : array {
    return $this->getConfig()->get() ?? [];
  }

}
