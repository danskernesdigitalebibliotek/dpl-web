<?php

namespace Drupal\dpl_react;

use Drupal\Core\Config\Config;

/**
 * Interface for instances of Drupal configuration used by React applications.
 */
interface DplReactConfigInterface {

  /**
   * Get formatted configuration for a React application.
   *
   * This configuration is expected to be converted into a format that can be
   * used by a React application. Normally this means that the configuration
   * is converted into a JSON string.
   *
   * Typical activities that are performed during this conversion are:
   * - Ensuring types are correct
   * - Conversion of names from snake_case to camelCase
   *
   * @return mixed[]
   *   The configuration.
   */
  public function getConfig(): array;

  /**
   * Load the raw Drupal configuration object.
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
