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
 *   id = "dpl_fbi_work_id",
 *   type_sdl = "WorkId",
 * )
 */
class WorkIdItem extends GraphQLComposeFieldTypeBase implements FieldProducerItemInterface {

  use FieldProducerTrait;

  /**
   * {@inheritdoc}
   */
  public function resolveFieldItem(FieldItemInterface $item, FieldContext $context): mixed {

    return [
      'work_id' => $item->value ?? NULL,
      'material_type' => $item->material_type ?? NULL,
    ];
  }

}
