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
 *   id = "Color",
 * )
 */
class ColorType extends GraphQLComposeSchemaTypeBase {

  /**
   * @inheritDoc
   */
  public function getTypes(): array {
    $types = [];

    $types[] = new ObjectType([
      'name' => $this->getPluginId(),
      'description' => (string) $this->t('A color field.'),
      'fields' => fn() => [
        'color' => [
          'type' => Type::string(),
          'description' => (string) $this->t('The color value in #HEX format.'),
        ],
        'opacity' => [
          'type' => Type::float(),
          'description' => (string) $this->t('The opacity value.'),
        ],
      ],
    ]);

    return $types;
  }

}
