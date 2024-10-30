<?php

namespace Drupal\dpl_graphql\Plugin\GraphQL\SchemaExtension;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql_compose\Plugin\GraphQL\SchemaExtension\ResolverOnlySchemaExtensionPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * DPL configuration GraphQL schema extension.
 *
 * @SchemaExtension(
 *   id = "dpl_configuration",
 *   name = "DPL Configuration",
 *   description = @Translation("DPL configuration schema extensions for GraphQL Compose."),
 *   schema = "graphql_compose",
 * )
 */
class DplConfigurationSchemaExtension extends ResolverOnlySchemaExtensionPluginBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('config.factory'),
      $container->get('entity_field.manager'),
      $container->get('entity_type.manager'),
      $container->get('graphql_compose.entity_type_manager'),
      $container->get('graphql_compose.field_type_manager'),
      $container->get('graphql_compose.schema_type_manager'),
      $container->get('language_manager'),
      $container->get('module_handler'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry): void {

    $builder = new ResolverBuilder();

    $registry->addFieldResolver(
      'DplConfiguration',
      'description',
      $builder->callback(fn () => "This field is added as the SchemaType needs to have atleast 1 field.")
    );
  }

}
