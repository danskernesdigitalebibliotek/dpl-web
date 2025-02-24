<?php

namespace Drupal\bnf_server\Plugin\GraphQL\SchemaExtension;

use Drupal\bnf_server\GraphQL\NewContentResponse;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;

/**
 * Extends the GraphQL schema with BNF server extensions.
 *
 * This adds the resolvers that produces the responses for our custom queries
 * and mutations.
 *
 * @SchemaExtension(
 *   id = "bnf_server",
 *   name = "BNF Server Extension",
 *   schema = "graphql_compose"
 * )
 */
class BnfServerExtension extends SdlSchemaExtensionPluginBase {

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry): void {
    $builder = new ResolverBuilder();

    $registry->addFieldResolver('Mutation', 'import',
    $builder->produce('import_producer')
      ->map('uuid', $builder->fromArgument('uuid'))
      ->map('callbackUrl', $builder->fromArgument('callbackUrl'))
    );

    $registry->addFieldResolver('Query', 'newContent',
    $builder->produce('new_content_producer')
      ->map('uuid', $builder->fromArgument('uuid'))
      ->map('since', $builder->fromArgument('since'))
    );

    $registry->addFieldResolver('NewContentResponse', 'errors',
    $builder->callback(function (NewContentResponse $response) {
      return $response->getViolations();
    }));

  }

}
