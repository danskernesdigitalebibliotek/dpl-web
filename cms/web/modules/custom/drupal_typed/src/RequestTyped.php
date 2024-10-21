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
    private Request $request,
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

  /**
   * Retrieve a list of values as integers.
   *
   * This method retrieves a string value from the request, splits it using the
   * provided separator, and returns an array of integers. If the value is null,
   * the default array will be returned.
   *
   * @param string $key
   *   The key to retrieve from the request.
   * @param int[] $default
   *   The default array of integers to return if the key does not exist.
   * @param string $separator
   *   The separator used to split the string value. Defaults to a comma (",").
   *
   * @return int[]
   *   An array of integers.
   */
  public function getInts(string $key, array $default = [], string $separator = ","): array {
    $value = $this->request->get($key);
    if ($value === NULL) {
      return $default;
    }
    $strings = \Safe\preg_split("/\s*{$separator}\s*/", $value, PREG_NO_ERROR);
    return array_map(fn($value) => intval($value), $strings);
  }

}
