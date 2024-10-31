<?php

namespace Drupal\dpl_graphql\Plugin\GraphQL\SchemaExtension;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_unilogin\UniloginConfiguration;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql_compose\Plugin\GraphQL\SchemaExtension\ResolverOnlySchemaExtensionPluginBase;
use Drupal\graphql_compose\Plugin\GraphQLComposeEntityTypeManager;
use Drupal\graphql_compose\Plugin\GraphQLComposeFieldTypeManager;
use Drupal\graphql_compose\Plugin\GraphQLComposeSchemaTypeManager;
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
   * DplConfigurationSchemaExtension constructor.
   *
   * @param array $configuration
   *   The plugin configuration array.
   * @param string $pluginId
   *   The plugin id.
   * @param array $pluginDefinition
   *   The plugin definition array.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   The config factory service.
   * @param \Drupal\Core\Entity\EntityFieldManagerInterface $entityFieldManager
   *   The entity field manager service.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   The entity type manager service.
   * @param \Drupal\graphql_compose\Plugin\GraphQLComposeEntityTypeManager $gqlEntityTypeManager
   *   The entity type plugin manager service.
   * @param \Drupal\graphql_compose\Plugin\GraphQLComposeFieldTypeManager $gqlFieldTypeManager
   *   The field type plugin manager service.
   * @param \Drupal\graphql_compose\Plugin\GraphQLComposeSchemaTypeManager $gqlSchemaTypeManager
   *   The schema type plugin manager service.
   * @param \Drupal\Core\Language\LanguageManagerInterface $languageManager
   *   The language manager service.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $moduleHandler
   *   The module handler service.
   * @param \Drupal\dpl_unilogin\UniloginConfiguration $uniloginConfiguration
   *   Unilogin configuration.
   */
  public function __construct(
    array $configuration,
    $pluginId,
    $pluginDefinition,
    protected ConfigFactoryInterface $configFactory,
    protected EntityFieldManagerInterface $entityFieldManager,
    protected EntityTypeManagerInterface $entityTypeManager,
    protected GraphQLComposeEntityTypeManager $gqlEntityTypeManager,
    protected GraphQLComposeFieldTypeManager $gqlFieldTypeManager,
    protected GraphQLComposeSchemaTypeManager $gqlSchemaTypeManager,
    protected LanguageManagerInterface $languageManager,
    protected ModuleHandlerInterface $moduleHandler,
    private UniloginConfiguration $uniloginConfiguration,
  ) {
    parent::__construct(
      $configuration,
      $pluginId,
      $pluginDefinition,
      $configFactory,
      $entityFieldManager,
      $entityTypeManager,
      $gqlEntityTypeManager,
      $gqlFieldTypeManager,
      $gqlSchemaTypeManager,
      $languageManager,
      $moduleHandler
    );
    $this->configuration = $configuration;
  }

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
      $container->get('dpl_unilogin.settings')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry): void {

    $unilogin_api_endpoint = $this->uniloginConfiguration->getUniloginApiEndpoint();
    $unilogin_api_wellknown_endpoint = $this->uniloginConfiguration->getUniloginApiWellknownEndpoint();
    $unilogin_client_id = $this->uniloginConfiguration->getUniloginApiClientId();
    $unilogin_client_secret = $this->uniloginConfiguration->getUniloginApiClientSecret();

    $builder = new ResolverBuilder();

    $registry->addFieldResolver(
      type: 'Query',
      field: 'dplConfiguration',
      resolver: $builder->callback(fn() => [
        'unilogin' => [
          'unilogin_api_url' => $unilogin_api_endpoint,
          'unilogin_api_wellknown_url' => $unilogin_api_wellknown_endpoint,
          'unilogin_api_client_id' => $unilogin_client_id,
          'unilogin_api_client_secret' => $unilogin_client_secret,
        ],
      ])
    );
  }

}
