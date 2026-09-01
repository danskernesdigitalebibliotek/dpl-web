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
   * Retrieves a raw value from the request.
   *
   * Symfony 7.4 deprecated Request::get(). It looked through the route
   * attributes, the query string and the request body in that order, and
   * callers rely on all three, so do the same lookup here. The query and
   * request bags are read through all() because InputBag::get() rejects
   * anything that is not a scalar.
   */
  private function getRaw(string $key): mixed {
    if ($this->request->attributes->has($key)) {
      return $this->request->attributes->get($key);
    }
    if ($this->request->query->has($key)) {
      return $this->request->query->all()[$key];
    }
    if ($this->request->request->has($key)) {
      return $this->request->request->all()[$key];
    }
    return NULL;
  }

  /**
   * Retrieve a value as a string.
   */
  public function getString(string $key, ?string $default = NULL): ?string {
    $value = $this->getRaw($key);
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
    $value = $this->getRaw($key);
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
    $value = $this->getRaw($key);
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
    $value = $this->getRaw($key);
    if ($value === NULL) {
      return $default;
    }
    $strings = \Safe\preg_split("/\s*{$separator}\s*/", $value, -1, PREG_SPLIT_NO_EMPTY);
    return array_map(fn($value) => intval($value), $strings);
  }

}
