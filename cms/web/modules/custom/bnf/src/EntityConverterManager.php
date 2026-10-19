<?php

declare(strict_types=1);

namespace Drupal\bnf;

use Drupal\bnf\Attribute\EntityConverter;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Plugin\DefaultPluginManager;

/**
 * Manages BNF entity converter plugins.
 */
class EntityConverterManager extends DefaultPluginManager {

  /**
   * Constructor.
   *
   * @param \Traversable<string> $namespaces
   *   An object that implements \Traversable which contains the root paths
   *   keyed by the corresponding namespace to look for plugin implementations.
   * @param \Drupal\Core\Cache\CacheBackendInterface $cache_backend
   *   Cache backend instance to use.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler.
   */
  public function __construct(
    \Traversable $namespaces,
    CacheBackendInterface $cache_backend,
    ModuleHandlerInterface $module_handler,
  ) {
    parent::__construct(
      'Plugin/bnf_entity_converter',
      $namespaces,
      $module_handler,
      NULL,
      EntityConverter::class,
    );

    $this->alterInfo('bnf_entity_converter');
    $this->setCacheBackend($cache_backend, 'bnf_entity_converter_plugins');
  }

}
