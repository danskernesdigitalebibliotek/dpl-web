<?php

declare(strict_types=1);

namespace Drupal\bnf\Exception;

/**
 * Custom exception, used when node already exists upstream.
 */
class AlreadyExistsException extends \RuntimeException {

  /**
   * Constructor.
   */
  // phpcs:ignore Generic.CodeAnalysis.UselessOverridingMethod.Found
  public function __construct(
    string $message = 'Node has previously been imported.',
    int $code = 0,
    ?\Throwable $previous = NULL,
  ) {
    parent::__construct($message, $code, $previous);
  }

}
