<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_entity_converter;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\bnf\EntityConverterInterface;
use Drupal\bnf\FieldConverterManager;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Plugin\PluginBase;

/**
 * Base class for BNF converters.
 */
abstract class EntityConverterBase extends PluginBase implements EntityConverterInterface, ContainerFactoryPluginInterface {

  use AutowirePluginTrait;

  /**
   * Constructor.
   */
  public function __construct(
    array $configuration,
    string $plugin_id,
    array $plugin_definition,
    protected FieldConverterManager $fieldConverterManager,
    protected EntityTypeManagerInterface $entityTypeManager,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritdoc}
   */
  public function normalize(FieldableEntityInterface $entity): array {
    $data = [];

    foreach ($this->getFields() as $name => $type) {
      $fieldData = $entity->get($name);

      if (!$fieldData instanceof FieldItemListInterface) {
        throw new \RuntimeException("Unknown field '{$name}' in normalize");
      }

      $data[$name] = $this->fieldConverterManager->normalize($type, $fieldData);
    }

    return $data;
  }

  /**
   * {@inheritdoc}
   */
  public function denormalize(array $data): FieldableEntityInterface {
    /** @var array{entity_type: string, bundle: string} $pluginDefinition */
    $pluginDefinition = $this->getPluginDefinition();
    $storage = $this->entityTypeManager->getStorage($pluginDefinition['entity_type']);
    $bundleKey = $this->entityTypeManager->getDefinition($pluginDefinition['entity_type'])->getKey('bundle');

    $uuid = $this->fieldConverterManager->denormalize('string', $data['uuid']);
    $uuid = reset($uuid);
    $uuid = $uuid['value'];

    /** @var \Drupal\Core\Entity\FieldableEntityInterface[] $entities */
    $entities = $storage->loadByProperties(['uuid' => $uuid]);
    if ($entities) {
      /** @var \Drupal\Core\Entity\FieldableEntityInterface $entity */
      $entity = reset($entities);
    }
    else {
      $values = [
        'uuid' => $uuid,
      ];

      if ($bundleKey) {
        $values[$bundleKey] = $pluginDefinition['bundle'] ?
          $pluginDefinition['bundle'] : $pluginDefinition['entity_type'];
      }

      /** @var \Drupal\Core\Entity\FieldableEntityInterface $entity */
      $entity = $storage->create($values);
    }

    foreach ($this->getFields() as $name => $type) {
      if (!isset($data[$name])) {
        throw new \RuntimeException("Uspecified field {$name} in denormalize");
      }

      $entity->set($name, $this->fieldConverterManager->denormalize($type, $data[$name]));
    }

    return $entity;
  }

  /**
   * {@inheritdoc}
   */
  public function getDependees(FieldableEntityInterface $entity): array {
    $dependees = [];

    foreach ($this->getFields() as $name => $type) {
      $fieldData = $entity->get($name);

      if ($fieldData instanceof FieldItemListInterface) {
        $fieldDependees = $this->fieldConverterManager->getDependees($type, $fieldData);
        foreach ($fieldDependees as $dependee) {
          $dependees[] = $dependee;
        }
      }
    }

    return array_values(array_unique($dependees));
  }

  /**
   * Get fields, with required additions.
   *
   * @return array<string, string>
   *   Field type mapping.
   */
  private function getFields(): array {
    $fields = $this->fields();

    // Do allow subclasses to define their own type, in case it comes in handy.
    if (!isset($fields['uuid'])) {
      $fields['uuid'] = 'string';
    }

    return $fields;
  }

}
