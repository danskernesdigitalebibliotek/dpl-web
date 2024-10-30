<?php

declare(strict_types=1);

namespace Drupal\dpl_unilogin\Plugin\GraphQLCompose\SchemaType;

use Drupal\graphql_compose\Plugin\GraphQLCompose\GraphQLComposeSchemaTypeBase;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

/**
 * {@inheritdoc}
 *
 * @GraphQLComposeSchemaType(
 *   id = "UniloginConfiguration",
 * )
 */
class UniloginConfigurationType extends GraphQLComposeSchemaTypeBase {

  /**
   * {@inheritdoc}
   */
  public function getTypes(): array {
    $types = [];

    $types[] = new ObjectType([
      'name' => $this->getPluginId(),
      'description' => (string) $this->t('List of DPL-Go Unilogin configuration.'),
      'fields' => fn () => [
        'unilogin_api_url' => ['type' => Type::nonNull(Type::string())],
        'unilogin_api_wellknown_url' => ['type' => Type::nonNull(Type::string())],
        'unilogin_api_client_id' => ['type' => Type::nonNull(Type::string())],
        'unilogin_api_client_secret' => ['type' => Type::nonNull(Type::string())],
      ],
    ]);

    return $types;
  }

  /**
   * {@inheritDoc}
   */
  public function getExtensions(): array {
    $extensions = parent::getExtensions();

    $extensions[] = new ObjectType([
      'name' => 'DplConfiguration',
      'fields' => fn() => [
        'unilogin' => static::type($this->getPluginId()),
      ],
    ]);

    return $extensions;
  }

}
