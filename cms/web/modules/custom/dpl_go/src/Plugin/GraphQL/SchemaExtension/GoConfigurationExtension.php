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
    $registry->addFieldResolver('GoConfiguration', 'adgangsplatformen', $builder->callback(fn () => TRUE));

    $registry->addFieldResolver('GoConfiguration', 'unilogin',
      $builder->produce('unilogin_info_producer')
    );

    $registry->addFieldResolver('GoConfiguration', 'loginUrls', $builder->callback(fn () => TRUE));
    $registry->addFieldResolver('GoLoginUrls', 'adgangsplatformen',
      $builder->produce('go_adgangsplatformen_login_url')
    );
  }

}
