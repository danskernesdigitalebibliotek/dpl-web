<?php

declare(strict_types=1);

namespace Drupal\dpl_login\Plugin\GraphQLCompose\SchemaType;

use Drupal\graphql_compose\Plugin\GraphQLCompose\GraphQLComposeSchemaTypeBase;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

/**
 * {@inheritdoc}
 *
 * @GraphQLComposeSchemaType(
 *   id = "DplGoUniloginConfiguration",
 * )
 */
class DplGoUniloginConfigurationType extends GraphQLComposeSchemaTypeBase {

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
   * {@inheritdoc}
   */
  public function getExtensions(): array {
    $extensions = parent::getExtensions();

    $extensions[] = new ObjectType([
      'name' => 'Query',
      'fields' => fn () => [
        'dplGoUniloginConfiguration' => [
          'type' => Type::nonNull(static::type($this->getPluginId())),
          'description' => (string) $this->t('List of DPL-Go Unilogin configuration.'),
        ],
      ],
    ]);

    return $extensions;
  }

}
