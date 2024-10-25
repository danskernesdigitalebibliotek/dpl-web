<?php

namespace Drupal\dpl_login\Plugin\GraphQL\SchemaExtension;

use Drupal\config_pages\ConfigPagesLoaderServiceInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql_compose\Plugin\GraphQL\SchemaExtension\ResolverOnlySchemaExtensionPluginBase;
use Drupal\graphql_compose\Plugin\GraphQLComposeEntityTypeManager;
use Drupal\graphql_compose\Plugin\GraphQLComposeFieldTypeManager;
use Drupal\graphql_compose\Plugin\GraphQLComposeSchemaTypeManager;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Dpl-Go Unilogin configuration GraphQL schema extension.
 *
 * @SchemaExtension(
 *   id = "dpl_go_unilogin_configuration",
 *   name = "DPL-Go Unilogin Configuration",
 *   description = @Translation("DPL-Go Unilogin configuration schema extensions for GraphQL Compose."),
 *   schema = "graphql_compose",
 * )
 */
class DplGoUniloginConfigurationSchemaExtension extends ResolverOnlySchemaExtensionPluginBase implements ContainerFactoryPluginInterface {

  /**
   * Drupal\config_pages\ConfigPagesInterface.
   *
   * @var \Drupal\config_pages\ConfigPagesInterface
   */
  protected $configPagesLoader;

  /**
   * DplGoUniloginConfigurationSchemaExtension constructor.
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
   * @param \Drupal\config_pages\ConfigPagesLoaderServiceInterface $configPagesLoader
   *   The ConfigPages loader service.
   */
  public function __construct(
    array $configuration,
    $pluginId,
    array $pluginDefinition,
    protected ConfigFactoryInterface $configFactory,
    protected EntityFieldManagerInterface $entityFieldManager,
    protected EntityTypeManagerInterface $entityTypeManager,
    protected GraphQLComposeEntityTypeManager $gqlEntityTypeManager,
    protected GraphQLComposeFieldTypeManager $gqlFieldTypeManager,
    protected GraphQLComposeSchemaTypeManager $gqlSchemaTypeManager,
    protected LanguageManagerInterface $languageManager,
    protected ModuleHandlerInterface $moduleHandler,
    ConfigPagesLoaderServiceInterface $configPagesLoader,
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
    $this->configPagesLoader = $configPagesLoader;
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
      $container->get('config_pages.loader')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry) {

    $unilogin_configuration = $this->configPagesLoader->load('unilogin_configuration');
    if (!$unilogin_configuration) {
      \Drupal::logger('dpl_go_unilogin')->error('UniLogin configuration config not found.');

    }
    else {
      $unilogin_api_endpoint = $unilogin_configuration->get('field_unilogin_api_endpoint')->value;
      $unilogin_api_wellknown_endpoint = $unilogin_configuration->get('field_unilogin_api_wellknown_end')->value;
      $unilogin_client_id = $unilogin_configuration->get('field_unilogin_client_id')->value;
      $unilogin_client_secret = $unilogin_configuration->get('field_unilogin_client_secret')->value;
    }

    $builder = new ResolverBuilder();

    $registry->addFieldResolver(
      type: 'Query',
      field: 'dplGoUniloginConfiguration',
      resolver: $builder->callback(fn() => [
        'unilogin_api_url' => isset($unilogin_api_endpoint) ?? '',
        'unilogin_api_wellknown_url' => isset($unilogin_api_wellknown_endpoint) ?? '',
        'unilogin_api_client_id' => isset($unilogin_client_id) ?? '',
        'unilogin_api_client_secret' => isset($unilogin_client_secret) ?? '',
      ])
    );
  }

}
