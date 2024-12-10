<?php

namespace Drupal\bnf_server\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;

/**
 * GraphQL extension, informing Drupal of our custom producer.
 *
 * @SchemaExtension(
 *   id = "import_request_extension",
 *   name = "Import Request Extension",
 *   schema = "graphql_compose"
 * )
 */
class ImportRequestExtension extends SdlSchemaExtensionPluginBase {

  /**
   * Registers the resolvers for the schema.
   */
  public function registerResolvers(ResolverRegistryInterface $registry): void {
    $builder = new ResolverBuilder();
    $registry->addFieldResolver('Mutation', 'importRequest',
      $builder->produce('import_request_producer')
        ->map('uuid', $builder->fromArgument('uuid'))
        ->map('callbackUrl', $builder->fromArgument('callbackUrl'))
    );
  }

}
