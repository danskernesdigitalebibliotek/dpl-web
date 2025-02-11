<?php

declare(strict_types=1);

namespace Drupal\bnf_server\GraphQL;

/**
 * Response for the import mutation.
 */
class ImportResponse {

  /**
   * Result of the import.
   *
   * Either 'success', 'failure' or 'duplicate'.
   */
  public ImportStatus $status = ImportStatus::Failure;

  /**
   * User friendly message.
   */
  public string $message = 'Unknown error';

}
