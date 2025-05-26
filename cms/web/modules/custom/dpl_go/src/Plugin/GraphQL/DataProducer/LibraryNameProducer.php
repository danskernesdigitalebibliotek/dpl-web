<?php

namespace Drupal\dpl_go\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Theme\ThemeManagerInterface;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Resolves the name of the library.
 *
 * @DataProducer(
 *   id = "library_name",
 *   name = "Library Name Producer",
 *   description = "Provides the library name for Go.",
 *   produces = @ContextDefinition("any",
 *     label = "Request Response"
 *   )
 * )
 */
class LibraryNameProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected ThemeManagerInterface $themeManager,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('theme.manager'),
    );
  }

  /**
   * Resolves the library name.
   */
  public function resolve(FieldContext $field_context): string {
    $field_context->addCacheableDependency((new CacheableMetadata())->setCacheMaxAge(0));
    $theme = $this->themeManager->getActiveTheme()->getName();
    return theme_get_setting('logo_title', $theme);
  }

}
