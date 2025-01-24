<?php

namespace Drupal\dpl_library_token\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;

/**
 * Dpl Token functionality.
 *
 * @SchemaExtension(
 *   id = "dpl_library_token",
 *   name = "Dpl Library Token extension",
 *   description = "Adding library token to the Dpl Token query.",
 *   schema = "graphql_compose"
 * )
 */
class DplLibraryTokenExtension extends SdlSchemaExtensionPluginBase {

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry): void {
    $builder = new ResolverBuilder();
    $registry->addFieldResolver('AdgangsplatformenToken', 'library',
      $builder->produce('adgangsplatformen_library_token_producer')
    );
  }

}
