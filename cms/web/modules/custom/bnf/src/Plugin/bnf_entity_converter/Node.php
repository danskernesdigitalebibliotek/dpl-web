<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_entity_converter;

/**
 * Base class for Node converters.
 */
class Node extends EntityConverterBase {

  /**
   * {@inheritdoc}
   */
  public function fields(): array {
    return [
      'title' => 'string',
    ];
  }

}
