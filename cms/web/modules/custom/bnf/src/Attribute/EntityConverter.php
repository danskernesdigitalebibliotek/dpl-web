<?php

declare(strict_types=1);

namespace Drupal\bnf\Attribute;

use Drupal\Component\Plugin\Attribute\Plugin;

/**
 * Defines attribute to declare BNF converters.
 */
#[\Attribute(\Attribute::TARGET_CLASS)]
class EntityConverter extends Plugin {

  /**
   * Constructor.
   */
  public function __construct(
    public readonly string $id,
    public readonly string $entity_type,
    public readonly ?string $bundle = NULL,
  ) {
  }

}
