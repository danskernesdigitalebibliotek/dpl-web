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
   * {@inheritDoc}
   */
  public function resolveFieldItem(FieldItemInterface $item, FieldContext $context): mixed {

    return [
      'value' => $item->value ?? NULL,
      'branch' => $item->branch ?? NULL,
      'department' => $item->department ?? NULL,
      'location' => $item->location ?? NULL,
      'sublocation' => $item->sublocation ?? NULL,
      'sort' => $item->sort ?? NULL,
      'onshelf' => $item->onshelf ?? NULL,
      'firstAccessionDateValue' => $item->first_accession_date_value ?? NULL,
      'firstAccessionDateOperator' => $item->first_accession_date_operator ?? NULL,
    ];
  }

}
