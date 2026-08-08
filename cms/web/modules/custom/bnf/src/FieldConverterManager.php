<?php

declare(strict_types=1);

namespace Drupal\bnf;

use Drupal\bnf\Attribute\FieldConverter;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Plugin\DefaultPluginManager;

/**
 * Manages BNF field converter plugins.
 */
class FieldConverterManager extends DefaultPluginManager {

  /**
   * Static cache of converters.
   *
   * @var \Drupal\bnf\FieldConverterInterface[]
   */
  protected array $converters = [];

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
      'Plugin/bnf_field_converter',
      $namespaces,
      $module_handler,
      NULL,
      FieldConverter::class,
    );

    $this->alterInfo('bnf_field_converter');
    $this->setCacheBackend($cache_backend, 'bnf_field_converter_plugins');
  }

  /**
   * Normalizes field data to a network array.
   *
   * This returns an array of array field values, regardless of the fields
   * configured cardinality.
   *
   * @param string $id
   *   Type of field.
   * @param \Drupal\Core\Field\FieldItemListInterface<\Drupal\Core\Field\FieldItemInterface> $itemList
   *   Field items to normalize.
   */
  public function normalize(string $id, FieldItemListInterface $itemList): mixed {
    $converter = $this->getConverter($id);
    return $converter->normalize($itemList);
  }

  /**
   * Denormalizes network data to field data.
   *
   * @param string $id
   *   Type of field.
   * @param array<int, mixed> $data
   *   Normalized data.
   */
  public function denormalize(string $id, array $data): mixed {
    $converter = $this->getConverter($id);
    return $converter->denormalize($data);
  }

  /**
   * Gets field dependees.
   *
   * @param string $id
   *   Type of field.
   * @param \Drupal\Core\Field\FieldItemListInterface<\Drupal\Core\Field\FieldItemInterface> $itemList
   *   Field items to process.
   *
   * @return string[]
   *   An array of dependees.
   */
  public function getDependees(string $id, FieldItemListInterface $itemList): array {
    $converter = $this->getConverter($id);
    return $converter->getDependees($itemList);
  }

  /**
   * Get converter.
   *
   * Uses a static cache.
   */
  protected function getConverter(string $id): FieldConverterInterface {
    if (!isset($this->converters[$id])) {
      /** @var \Drupal\bnf\FieldConverterInterface $converter */
      $converter = $this->createInstance($id);
      $this->converters[$id] = $converter;
    }

    return $this->converters[$id];
  }

}
