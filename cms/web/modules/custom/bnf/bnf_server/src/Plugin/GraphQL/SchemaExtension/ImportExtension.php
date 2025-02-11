<?php

namespace Drupal\bnf_server\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;

/**
 * Extends the GraphQL schema to enable importing content.
 *
 * This class defines the `import` mutation, allowing external systems
 * to request content imports via GraphQL. It registers a resolver that links
 * the mutation to a specific producer, `import_producer`.
 *
 * @SchemaExtension(
 *   id = "import_extension",
 *   name = "Import Extension",
 *   schema = "graphql_compose"
 * )
 */
class ImportExtension extends SdlSchemaExtensionPluginBase {

  /**
   * Registers the resolver for the `import` mutation.
   *
   * This mutation takes a `uuid` and a `callbackUrl` as input, delegating the
   * logic to the `import_producer`. The producer handles the content
   * import process by calling the external GraphQL endpoint (callbackUrl).
   */
  public function registerResolvers(ResolverRegistryInterface $registry): void {
    $builder = new ResolverBuilder();
    $registry->addFieldResolver('Mutation', 'import',
      $builder->produce('import_producer')
        ->map('uuid', $builder->fromArgument('uuid'))
        ->map('callbackUrl', $builder->fromArgument('callbackUrl'))
    );
  }

}
