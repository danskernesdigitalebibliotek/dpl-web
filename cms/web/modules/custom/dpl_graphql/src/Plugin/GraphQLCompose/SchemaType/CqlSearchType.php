<?php

declare(strict_types=1);

namespace Drupal\dpl_graphql\Plugin\GraphQLCompose\SchemaType;

use Drupal\graphql_compose\Plugin\GraphQLCompose\GraphQLComposeSchemaTypeBase;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

/**
 * {@inheritdoc}
 *
 * @GraphQLComposeSchemaType(
 *   id = "CQLSearch",
 * )
 */
class CqlSearchType extends GraphQLComposeSchemaTypeBase {

  /**
   * {@inheritdoc}
   */
  public function getTypes(): array {

    $types = [];

    $types[] = new ObjectType([
      'name' => $this->getPluginId(),
      'description' => (string) $this->t('A CQL search string.'),
      'fields' => fn() => [
        'value' => [
          'type' => Type::string(),
          'description' => (string) $this->t('The CQL search string.'),
        ],
        'branch' => [
          'type' => Type::string(),
          'description' => (string) $this->t('Branch filter.'),
        ],
        'department' => [
          'type' => Type::string(),
          'description' => (string) $this->t('Department filter.'),
        ],
        'location' => [
          'type' => Type::string(),
          'description' => (string) $this->t('Location filter.'),
        ],
        'sublocation' => [
          'type' => Type::string(),
          'description' => (string) $this->t('Sublocation filter.'),
        ],
        'sort' => [
          'type' => Type::string(),
          'description' => (string) $this->t('Sort order.'),
        ],
        'onshelf' => [
          'type' => Type::string(),
          'description' => (string) $this->t('On-shelf filter.'),
        ],
        'firstAccessionDateValue' => [
          'type' => Type::string(),
          'description' => (string) $this->t('First accession date value.'),
        ],
        'firstAccessionDateOperator' => [
          'type' => Type::string(),
          'description' => (string) $this->t('First accession date operator.'),
        ],
      ],
    ]);

    return $types;
  }

}
