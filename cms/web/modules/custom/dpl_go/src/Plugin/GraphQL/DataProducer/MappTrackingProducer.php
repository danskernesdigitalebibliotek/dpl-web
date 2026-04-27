<?php

namespace Drupal\dpl_go\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Resolves Mapp Intelligence tracking configuration.
 *
 * @DataProducer(
 *   id = "mapp_tracking_producer",
 *   name = "Mapp Tracking Producer",
 *   description = "Provides the Mapp Intelligence tracking configuration.",
 *   produces = @ContextDefinition("any",
 *     label = "Request Response"
 *   )
 * )
 */
class MappTrackingProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected ConfigFactoryInterface $configFactory,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): self {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('config.factory'),
    );
  }

  /**
   * Resolves the Mapp tracking configuration.
   *
   * @return mixed[]
   *   The Mapp tracking configuration.
   */
  public function resolve(FieldContext $field_context): array {
    $config = $this->configFactory->get('dpl_mapp.settings');
    $field_context->addCacheableDependency((new CacheableMetadata())->addCacheTags($config->getCacheTags()));

    return [
      'domain' => $config->get('domain'),
      'id' => $config->get('id'),
    ];
  }

}
