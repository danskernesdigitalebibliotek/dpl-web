<?php

declare(strict_types=1);

namespace Drupal\bnf\Attribute;

use Drupal\Component\Plugin\Attribute\Plugin;

/**
 * Defines attribute to declare BNF mappers.
 */
#[\Attribute(\Attribute::TARGET_CLASS)]
class BnfMapper extends Plugin {

  /**
   * Constructor.
   */
  public function __construct(
    public readonly string $id,
  ) {
  }

}
