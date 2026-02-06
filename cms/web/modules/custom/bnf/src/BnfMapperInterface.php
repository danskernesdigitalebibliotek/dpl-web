<?php

declare(strict_types=1);

namespace Drupal\bnf;

use Spawnia\Sailor\ObjectLike;

/**
 * Interface for BNF mapper plugins.
 */
interface BnfMapperInterface {

  /**
   * Map GraphQL object to Drupal type.
   *
   * @return mixed
   *   The mapped object.
   */
  public function map(ObjectLike $object): mixed;

}
