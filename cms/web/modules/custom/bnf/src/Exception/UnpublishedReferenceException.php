<?php

namespace Drupal\bnf\Exception;

/**
 * Exception thrown if unpublished or non-existent referenced node.
 */
class UnpublishedReferenceException extends \RuntimeException {

  public function __construct(
    string $message = "",
    int $code = 0,
    ?\Throwable $previous = NULL,
  ) {
    $message = $message ? $message : "Link to unpublished or non-existent node encountered.";
    parent::__construct($message, $code, $previous);
  }

}
