<?php

declare(strict_types=1);

namespace Drupal\dpl_graphql\Plugin\GraphQL\DataProducer;

use Drupal\Core\DependencyInjection\AutowiredInstanceTrait;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Base class for data producers with autowired constructor arguments.
 *
 * DataProducerPluginBase extends the component PluginBase rather than the core
 * one, so it doesn't get core's autowiring create(). This adds it back, so
 * subclasses only need to declare their dependencies in the constructor.
 */
abstract class AutowiredDataProducerPluginBase extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  use AutowiredInstanceTrait;

  /**
   * Instantiates the plugin using autowiring.
   *
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   *   The container to pull out services used in the plugin.
   * @param mixed[] $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   *
   * @return static
   *   Returns an instance of this plugin.
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return static::createInstanceAutowired($container, $configuration, $plugin_id, $plugin_definition);
  }

}
