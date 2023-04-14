<?php

namespace Drupal\dpl_react;

use Drupal\Core\Config\Config;

/**
 * Class that handles React App Config.
 */
interface DplReactConfigInterface {

  /**
   * Get formatted configuration.
   *
   * @return mixed[]
   *   The configuration.
   */
  public function getConfig(): array;

  /**
   * Load raw configuration.
   *
   * @return \Drupal\Core\Config\Config
   *   The configuration.
   */
  public function loadConfig(): Config;

  /**
   * The key of the configuration.
   *
   * @return string
   *   The key of the configuration.
   */
  public function getConfigKey(): string;

}
