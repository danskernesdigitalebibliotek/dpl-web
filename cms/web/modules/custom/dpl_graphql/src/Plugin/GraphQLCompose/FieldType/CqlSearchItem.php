<?php

declare(strict_types=1);

namespace Drupal\dpl_graphql\Plugin\GraphQLCompose\FieldType;

use Drupal\Core\Field\FieldItemInterface;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql_compose\Plugin\GraphQL\DataProducer\FieldProducerItemInterface;
use Drupal\graphql_compose\Plugin\GraphQL\DataProducer\FieldProducerTrait;
use Drupal\graphql_compose\Plugin\GraphQLCompose\GraphQLComposeFieldTypeBase;

/**
 * {@inheritDoc}
 *
 * @GraphQLComposeFieldType(
 *   id = "dpl_fbi_cql_search",
 *   type_sdl = "CQLSearch",
 * )
 */
class CqlSearchItem extends GraphQLComposeFieldTypeBase implements FieldProducerItemInterface {

  use FieldProducerTrait;

  /**
   * @inheritDoc
   */
  public function resolveFieldItem(FieldItemInterface $item, FieldContext $context) {

    return [
      'value' => isset($item->value) ? $item->value : NULL,
    ];
  }

}
