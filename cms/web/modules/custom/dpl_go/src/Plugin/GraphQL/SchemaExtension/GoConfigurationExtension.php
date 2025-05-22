<?php

namespace Drupal\dpl_go\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;

/**
 * Go Configuration.
 *
 * @SchemaExtension(
 *   id = "dpl_go",
 *   name = "Go configuration extension",
 *   description = "Go related configuration",
 *   schema = "graphql_compose"
 * )
 */
class GoConfigurationExtension extends SdlSchemaExtensionPluginBase {

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry): void {
    $builder = new ResolverBuilder();
    $registry->addFieldResolver('Query', 'goConfiguration', $builder->callback(fn () => TRUE));
    $registry->addFieldResolver('GoConfiguration', 'public', $builder->callback(fn () => TRUE));
    $registry->addFieldResolver('GoConfiguration', 'private', $builder->callback(fn () => TRUE));

    $registry->addFieldResolver('GoConfigurationPublic', 'loginUrls', $builder->callback(fn () => TRUE));
    $registry->addFieldResolver('GoLoginUrls', 'adgangsplatformen',
      $builder->produce('go_adgangsplatformen_login_url')
    );

    $registry->addFieldResolver('GoConfigurationPublic', 'logoutUrls', $builder->callback(fn () => TRUE));
    $registry->addFieldResolver('GoLogoutUrls', 'adgangsplatformen',
      $builder->produce('go_adgangsplatformen_logout_url')
    );

    $registry->addFieldResolver('GoConfigurationPublic', 'libraryInfo', $builder->callback(fn () => TRUE));
    $registry->addFieldResolver('GoLibraryInfo', 'name',
      $builder->produce('library_name')
    );

    $registry->addFieldResolver('GoConfigurationPrivate', 'unilogin',
      $builder->produce('unilogin_private_producer')
    );

    $registry->addFieldResolver('GoConfigurationPublic', 'unilogin',
      $builder->produce('unilogin_public_producer')
    );
  }

}
