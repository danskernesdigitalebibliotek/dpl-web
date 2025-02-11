<?php

declare(strict_types=1);

namespace Drupal\bnf_server\GraphQL;

/**
 * Possible statuses for import mutation.
 */
enum ImportStatus: string {
  case Success = 'success';
  case Failure = 'failure';
  case Duplicate = 'duplicate';
}
