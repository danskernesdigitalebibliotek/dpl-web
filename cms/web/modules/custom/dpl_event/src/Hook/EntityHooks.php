<?php

declare(strict_types=1);

namespace Drupal\dpl_event\Hook;

use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\field\FieldConfigInterface;

/**
 * Entity hooks for dpl_event module.
 */
class EntityHooks {

  /**
   * Require a text body in the paragraphs of events.
   *
   * Series always need one, as instances that have no paragraphs of their own
   * inherit those of the series. Instances need one when they have
   * paragraphs of their own.
   *
   * @param array<string, \Drupal\Core\Field\FieldDefinitionInterface> $fields
   *   The field definitions of the bundle, keyed by field name.
   * @param \Drupal\Core\Entity\EntityTypeInterface $entity_type
   *   The entity type of the bundle.
   * @param string $bundle
   *   The bundle.
   */
  #[Hook('entity_bundle_field_info_alter')]
  public function addTextBodyConstraint(array &$fields, EntityTypeInterface $entity_type, string $bundle): void {
    if (!in_array($entity_type->id(), ['eventseries', 'eventinstance'], TRUE)) {
      return;
    }

    $field = $fields['field_event_paragraphs'] ?? NULL;

    if (!$field instanceof FieldConfigInterface) {
      return;
    }

    $field->addConstraint('EventTextBody');
  }

}
