<?php

declare(strict_types=1);

namespace Drupal\bnf_server\GraphQL;

/**
 * Response for the ImportRequest mutation.
 */
class ImportRequestResponse {

  /**
   * Result of the import.
   *
   * Either 'success', 'failure' or 'duplicate'.
   */
  public string $status = 'failure';

  /**
   * User friendly message.
   */
  public string $message = 'Unknown error';

}
