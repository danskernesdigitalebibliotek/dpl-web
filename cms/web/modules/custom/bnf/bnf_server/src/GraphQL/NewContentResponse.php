<?php

declare(strict_types=1);

namespace Drupal\bnf_server\GraphQL;

use Drupal\graphql\GraphQL\Response\Response;

/**
 * Response for the newContent query.
 */
class NewContentResponse extends Response {

  /**
   * UUIDs of new content.
   *
   * @var string[]
   */
  public array $uuids = [];

}
