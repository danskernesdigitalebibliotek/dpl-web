<?php

declare(strict_types=1);

namespace Drupal\bnf;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Plugin\DefaultPluginManager;

/**
 * Manages BNF mapper plugins.
 */
class BnfMapperManager extends DefaultPluginManager {

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
      'Plugin/bnf_mapper',
      $namespaces,
      $module_handler,
      BnfMapperInterface::class,
      BnfMapper::class,
    );

    $this->alterInfo('bnf_mapper');
    $this->setCacheBackend($cache_backend, 'bnf_mapper_plugins');
  }
}
