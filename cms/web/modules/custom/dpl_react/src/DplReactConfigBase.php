<?php

namespace Drupal\dpl_react;

use ArrayKeysCaseTransform\ArrayKeys;
use Drupal\Core\Cache\CacheableDependencyInterface;
use Drupal\Core\Config\Config;
use Drupal\Core\Config\ConfigManagerInterface;

/**
 * Class that handles React App Config.
 */
abstract class DplReactConfigBase implements CacheableDependencyInterface, DplReactConfigInterface {

  /**
   * Constructs a new DplReactConfig object.
   */
  public function __construct(
    protected ConfigManagerInterface $configManager
  ) {}

  /**
   * Get the configuration entity.
   */
  public function loadConfig(): Config {
    return $this->configManager->getConfigFactory()->get($this->getConfigKey());
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheContexts() : array {
    return $this->loadConfig()->getCacheContexts();
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheTags() : array {
    return $this->loadConfig()->getCacheTags();
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() : int {
    return $this->loadConfig()->getCacheMaxAge();
  }

  /**
   * Get configuration.
   *
   * @return mixed[]
   *   The configuration.
   */
  public function getConfig() : array {
    if (!$config = $this->loadConfig()->get()) {
      return [];
    }

    return ArrayKeys::toCamelCase($config);
  }

}
