<?php

namespace Drupal\drupal_typed;

use Safe\DateTimeImmutable;
use Symfony\Component\HttpFoundation\Request;

/**
 * Wrapper around the Symfony request object to retrieve typed data.
 */
class RequestTyped {

  /**
   * Constructor.
   */
  public function __construct(
    private Request $request
  ) {}

  /**
   * Retrieve a value as a string.
   */
  public function getString(string $key, ?string $default = NULL): ?string {
    $value = $this->request->get($key);
    if ($value === NULL) {
      return $default;
    }
    elseif (!is_string($value)) {
      throw new \TypeError("Invalid value for {$key}: {$value} is not a string");
    }
    return $value;
  }

  /**
   * Retrieve a value as an integer.
   */
  public function getInt(string $key, ?int $default = NULL): ?int {
    $value = $this->request->get($key);
    if ($value === NULL) {
      return $default;
    }
    elseif (is_numeric($value)) {
      return intval($value);
    }
    else {
      throw new \TypeError("Invalid value for {$key}: {$value} is not an integer");
    }
  }

  /**
   * Retrieve a value as a data time.
   */
  public function getDateTime(string $key, ?\DateTimeInterface $default = NULL) : ?\DateTimeInterface {
    $value = $this->request->get($key);
    if ($value) {
      try {
        return new DateTimeImmutable($value);
      }
      catch (\Throwable $e) {
        throw new \TypeError("Invalid value for {$key}: {$value} is not a valid date. " . $e->getMessage());
      }
    }
    else {
      return $default;
    }
  }

}
