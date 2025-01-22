<?php

namespace Drupal\dpl_login\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;

/**
 * Dpl Token functionality.
 *
 * @SchemaExtension(
 *   id = "dpl_tokens",
 *   name = "Dpl Tokens extension",
 *   description = "Adding Dpl Token functionality.",
 *   schema = "graphql_compose"
 * )
 */
class DplTokensExtension extends SdlSchemaExtensionPluginBase {

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry): void {
    $builder = new ResolverBuilder();
    $registry->addFieldResolver('Query', 'dplTokens', $builder->callback(fn () => TRUE));
    $registry->addFieldResolver('DplTokens', 'adgangsplatformen', $builder->callback(fn () => TRUE));
    $registry->addFieldResolver('Adgangsplatformen', 'user',
    $builder->produce('adgangsplatformen_user_token_producer')
    );

  }

}
