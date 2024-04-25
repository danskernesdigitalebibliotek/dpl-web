<?php

namespace Drupal\dpl_event\Services;

use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\dpl_event\EventState;
use Drupal\node\NodeInterface;
use Drupal\recurring_events\Entity\EventInstance;

/**
 * Helper for managing cross-site logic for events, such as fallback fields.
 */
class EventHelper {

  /**
   * Load a field if it exists, and do the same for a possible fallback field.
   */
  public function getField(FieldableEntityInterface $entity, string $field_name, ?string $fallback_field_name = NULL): ?FieldItemListInterface {
    // First, let's look up the custom field - does it already have a value?
    if ($entity->hasField($field_name)) {
      $field = $entity->get($field_name);

      if (!$field->isEmpty()) {
        return $field;
      }
    }

    // Otherwise, let's look at the fallback field, from the series.
    if ($fallback_field_name && $entity->hasField($fallback_field_name)) {
      $field = $entity->get($fallback_field_name);

      if (!$field->isEmpty()) {
        return $field;
      }
    }

    return NULL;
  }

  /**
   * Load an eventinstance address - either from the series/instance or branch.
   */
  public function getAddressField(EventInstance $entity): ?FieldItemListInterface {
    $instance_field_name = 'field_event_address';
    $instance_fallback_field_name = 'event_address';
    $instance_field = $this->getField($entity, $instance_field_name, $instance_fallback_field_name);

    if ($instance_field instanceof FieldItemListInterface) {
      return $instance_field;
    }

    // Okay, now we want to look up the branch - first the custom, and otherwise
    // the fallback, from the series.
    $instance_branch_field_name = 'field_branch';
    $instance_fallback_branch_field_name = 'branch';
    $branch_field = $this->getField($entity, $instance_branch_field_name, $instance_fallback_branch_field_name);

    if (!$branch_field instanceof FieldItemListInterface) {
      return NULL;
    }

    $branch_address_field = 'field_address';
    $branch = $branch_field->referencedEntities()[0] ?? NULL;

    if (!($branch instanceof NodeInterface) || !$branch->hasField($branch_address_field)) {
      return NULL;
    }

    return $branch->get($branch_address_field);
  }

  /**
   * Get the EventState object of an eventinstance.
   */
  public function getState(EventInstance $entity): ?EventState {
    $field = $this->getField($entity, 'field_event_state', 'event_state');

    if (!$field instanceof FieldItemListInterface) {
      return NULL;
    }

    $states = array_map(function (array $value) {
      return EventState::from($value['value']);
    }, $field->getValue());

    $state = $states[0] ?? NULL;

    if ($state instanceof EventState) {
      return $state;
    }

    return NULL;
  }

}
