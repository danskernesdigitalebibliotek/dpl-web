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
 *   id = "WorkId",
 * )
 */
class WorkIdType extends GraphQLComposeSchemaTypeBase {

  /**
   * @inheritDoc
   */
  public function getTypes(): array {

    $types = [];

    $types[] = new ObjectType([
      'name' => $this->getPluginId(),
      'description' => (string) $this->t('A WorkID field.'),
      'fields' => fn() => [
        'value' => [
          'type' => Type::string(),
          'description' => (string) $this->t('The WorkID value'),
        ],
        'material_type' => [
          'type' => Type::string(),
          'description' => (string) $this->t('The material type (e.g., bog, e-bog).'),
        ],
      ],
    ]);

    return $types;
  }

}
