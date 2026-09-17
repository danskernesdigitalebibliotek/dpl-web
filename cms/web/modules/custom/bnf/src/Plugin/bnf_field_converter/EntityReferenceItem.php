<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_field_converter;

use Drupal\bnf\Attribute\FieldConverter;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Field\FieldItemListInterface;

/**
 * Field converter for entity_reference fields.
 *
 * This also works for entity_reference_revision fields as long as we're not
 * actually using the "revision" part.
 */
#[FieldConverter(id: 'entity_reference')]
class EntityReferenceItem extends FieldConverterBase {

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
      $entity = $item->get('entity')->getTarget()->getEntity();

      // Only passing entity type and uuid, as that's what's needed to find it.
      $data[] = [
        'type' => $entity->getEntityTypeId(),
        'uuid' => $entity->uuid(),
      ];
    }

    return $data;
  }

  /**
   * {@inheritdoc}
   */
  public function denormalize(array $data): mixed {
    $field_values = [];
    foreach ($data as $value) {
      $entity = $this->entityTypeManager->getStorage($value['type'])->loadByProperties([
        'uuid' => $value['uuid'],
      ]);

      if (!$entity) {
        throw new \RuntimeException(sprintf('Unknown %s %s', $value['type'], $value['uuid']));
      }
      $entity = reset($entity);

      $field_values[] = ['target_id' => $entity->id()];
    }

    return $field_values;
  }

  /**
   * {@inheritdoc}
   */
  public function getDependees(FieldItemListInterface $field_items): array {
    $dependees = [];
    foreach ($field_items as $item) {
      $entity = $item->get('entity')->getTarget()?->getEntity();
      if ($entity) {
        $dependees[] = $entity->getEntityTypeId() . ':' . $entity->uuid();
      }
    }
    return $dependees;
  }

}
