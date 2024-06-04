<?php

namespace Drupal\drupal_typed;

/**
 * Static Service Container wrapper with improved handling types.
 *
 * This is basically a wrapper around \Drupal with methods for ensuring and
 * communicating types to the surrounding codebase.
 */
class DrupalTyped {

  /**
   * Retrieves a service from the container.
   *
   * @param class-string<T> $className
   *   The required class name of the service to retrieve.
   * @param string $serviceName
   *   The ID of the service to retrieve.
   *
   * @template T of object
   *
   * @return T
   *   The specified service.
   */
  public static function service(string $className, string $serviceName): object {
    $service = \Drupal::service($serviceName);
    if (!$service instanceof $className) {
      $actualClass = get_class($service);
      throw new \TypeError("Service {$serviceName} of class {$actualClass} is not of class {$className}");
    }
    return $service;
  }

}
