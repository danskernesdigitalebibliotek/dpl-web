<?php

/**
 * @file
 * Event deploy hooks.
 *
 * These get run AFTER config-import.
 */

use Drupal\Core\Entity\FieldableEntityInterface;

/**
 * Pre-populate data to new non-WYSIWYG field field_description.
 *
 * We also empty out the old field. The field has been set to be hidden
 * from the editors, and we'll delete it in a future deploy.
 */
function dpl_event_deploy_port_description_fields() : string {
  $message = _dpl_event_port_wysiwyg('eventseries', 'field_event_description', 'field_description');
  $message .= _dpl_event_port_wysiwyg('eventinstance', 'field_event_description', 'field_description');

  return $message;
}

/**
 * A helper function, for porting WYSIWYG fields to plain textareas.
 */
function _dpl_event_port_wysiwyg(string $entity_type, string $source_field, string $target_field): string {
  $ids =
    \Drupal::entityQuery($entity_type)
      ->accessCheck(FALSE)
      ->execute();

  $entities =
    \Drupal::entityTypeManager()->getStorage($entity_type)->loadMultiple($ids);

  $numEntitiesUpdated = 0;
  foreach ($entities as $entity) {
    if (!($entity instanceof FieldableEntityInterface) || !$entity->hasField($source_field) || $entity->get($source_field)->isEmpty() || !$entity->hasField($target_field)) {
      continue;
    }

    $value = $entity->get($source_field)->getValue();
    $text = $value[0]['value'] ?? '';
    $text = strip_tags($text);

    $entity->set($target_field, $text);
    $entity->set($source_field, NULL);
    $entity->save();

    $numEntitiesUpdated++;
  }

  return t("Updated @count description fields on @entity_type \r\n", [
    "@count" => $numEntitiesUpdated,
    "@entity_type" => $entity_type,
  ])->render();
}
