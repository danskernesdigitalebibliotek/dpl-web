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
 *   id = "DplConfiguration",
 * )
 */
class DplConfigurationType extends GraphQLComposeSchemaTypeBase {

  /**
   * {@inheritdoc}
   */
  public function getTypes(): array {
    $types = [];
    $types[] = new ObjectType([
      'name' => $this->getPluginId(),
      'description' => (string) $this->t('DPL Configuration.'),
      'fields' => fn () => [
        'description' => ['type' => Type::string()],
      ],
    ]);

    return $types;
  }

  /**
   * {@inheritdoc}
   */
  public function getExtensions(): array {
    $extensions = parent::getExtensions();
    $extensions[] = new ObjectType([
      'name' => 'Query',
      'fields' => fn () => [
        'dplConfiguration' => [
          'type' => static::type($this->getPluginId()),
          'description' => (string) $this->t('DPL Configuration'),
        ],
      ],
    ]);

    return $extensions;
  }

}
