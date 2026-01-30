<?php

namespace Drupal\bnf\Exception;

/**
 * Exception thrown when recursive import limit is exceeded.
 */
class RecursionLimitExceededException extends \RuntimeException {

  public function __construct(
    string $message = "",
    int $code = 0,
    ?\Throwable $previous = NULL,
  ) {
    $message = $message ? $message : "Recursion limit exceeded.";
    parent::__construct($message, $code, $previous);
  }

}
