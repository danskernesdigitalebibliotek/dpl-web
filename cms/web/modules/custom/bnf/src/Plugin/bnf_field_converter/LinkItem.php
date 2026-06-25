<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_field_converter;

use Drupal\bnf\Attribute\FieldConverter;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Field\FieldItemListInterface;

/**
 * Field converter for link fields.
 */
#[FieldConverter(id: 'link')]
class LinkItem extends FieldConverterBase {

  /**
   * Constructor.
   */
  public function __construct(
    array $configuration,
    string $plugin_id,
    array $plugin_definition,
    protected EntityTypeManagerInterface $entityTypeManager,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritdoc}
   */
  public function normalize(FieldItemListInterface $field_items): mixed {
    $data = [];
    foreach ($field_items as $item) {
      $itemData = [
        'title' => $item->get('title')->getValue(),
        'options' => $item->get('options')->getValue(),
      ];

      $uri = $item->get('uri')->getValue();

      if ($uri && str_starts_with($uri, 'entity:')) {
        $parts = explode('/', substr($uri, 7), 2);

        if (count($parts) != 2) {
          throw new \RuntimeException(sprintf('Malformed internal entity URI: %s', $uri));
        }

        $entity_type = $parts[0];
        $entity_id = $parts[1];

        $entity = $this->entityTypeManager->getStorage($entity_type)->load($entity_id);
        if (!$entity) {
          throw new \RuntimeException(sprintf('Link field references unknown %s %s', $entity_type, $entity_id));
        }

        $itemData['entity_type'] = $entity_type;
        $itemData['uuid'] = $entity->uuid();
      }
      else {
        $itemData['uri'] = $uri;
      }

      $data[] = $itemData;
    }

    return $data;
  }

  /**
   * {@inheritdoc}
   */
  public function denormalize(array $data): mixed {
    $field_values = [];
    foreach ($data as $value) {
      $uri = $value['uri'] ?? NULL;

      if (isset($value['uuid'])) {
        if (!isset($value['entity_type'])) {
          throw new \RuntimeException(sprintf('Missing entity type for %s', $value['uuid']));

        }

        $entities = $this->entityTypeManager->getStorage($value['entity_type'])->loadByProperties(['uuid' => $value['uuid']]);

        if ($entities) {
          $entity = reset($entities);
          $uri = 'entity:' . $value['entity_type'] . '/' . $entity->id();
        }
        else {
          throw new \RuntimeException(sprintf('Unknown linked entity %s %s', $value['entity_type'], $value['uuid']));
        }
      }

      $field_values[] = [
        'uri' => $uri,
        'title' => $value['title'] ?? NULL,
        'options' => $value['options'] ?? [],
      ];
    }

    return $field_values;
  }

  /**
   * {@inheritdoc}
   */
  public function getDependees(FieldItemListInterface $field_items): array {
    $dependees = [];
    foreach ($field_items as $item) {
      $uri = $item->get('uri')->getValue();
      if ($uri && str_starts_with($uri, 'entity:')) {
        $parts = explode('/', substr($uri, 7), 2);
        if (count($parts) === 2) {
          $entity_type = $parts[0];
          $entity_id = $parts[1];

          $entity = $this->entityTypeManager->getStorage($entity_type)->load($entity_id);
          if ($entity) {
            $dependees[] = $entity->getEntityTypeId() . ':' . $entity->uuid();
          }
        }
      }
    }
    return $dependees;
  }

}
