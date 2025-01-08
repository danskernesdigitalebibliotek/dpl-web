<?php

namespace Drupal\bnf_server\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;

/**
 * Extends the GraphQL schema to enable importing content.
 *
 * This class defines the `importRequest` mutation, allowing external systems
 * to request content imports via GraphQL. It registers a resolver that links
 * the mutation to a specific producer, `import_request_producer`.
 *
 * @SchemaExtension(
 *   id = "import_request_extension",
 *   name = "Import Request Extension",
 *   schema = "graphql_compose"
 * )
 */
class ImportRequestExtension extends SdlSchemaExtensionPluginBase {

  /**
   * Registers the resolver for the `importRequest` mutation.
   *
   * This mutation takes a `uuid` and a `callbackUrl` as input, delegating the
   * logic to the `import_request_producer`. The producer handles the content
   * import process by calling the external GraphQL endpoint (callbackUrl).
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
