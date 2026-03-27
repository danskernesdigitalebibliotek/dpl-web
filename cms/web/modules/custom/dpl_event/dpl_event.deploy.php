<?php

/**
 * @file
 * Event deploy hooks.
 *
 * These get run AFTER config-import.
 */

use Drupal\Core\Entity\EntityStorageInterface;
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

/**
 * Update all eventinstances that are set to all day, to trigger time logic.
 */
function dpl_event_deploy_migrate_all_day_events(): string {
  $series_ids = \Drupal::entityTypeManager()->getStorage('eventseries')->getQuery()
    ->condition('field_event_all_day', '1')
    ->accessCheck(FALSE)
    ->execute();

  if (empty($series_ids)) {
    return 'Found no relevant events to update.';
  }

  $instance_storage = \Drupal::entityTypeManager()->getStorage('eventinstance');

  $instance_ids = $instance_storage->getQuery()
    ->condition('eventseries_id', $series_ids, 'IN')
    ->accessCheck(FALSE)
    ->execute();

  $instances = $instance_storage->loadMultiple($instance_ids);

  foreach ($instances as $instance) {
    $instance->save();
  }

  $count = count($instances);

  return "Updated $count all-day events, to set 00:00 - 23:59 time.";
}

/**
 * Unset address data from events that only have countries set.
 *
 * In a previous version, we set Denmark as the default country and made the
 * individual address fields optional.
 * This was an attempt to make the interface easier to use - but meant that the
 * address field would never be empty - and break the logic that pulls address
 * from the associated branch.
 *
 * We'll look up any eventinstances/eventseries that only have a country set as
 * an address and unset the value completely.
 *
 * Used by
 * - dpl_event_deploy_migrate_country_eventseries()
 * - dpl_event_deploy_migrate_country_eventinstances()
 */
function _dpl_event_unset_country_only_addresses(EntityStorageInterface $storage): string {
  $field_name = 'field_event_address';
  $query = $storage->getQuery();

  // NULL is saved in different ways, in series/instances, for some reason.
  $condition_group = $query->orConditionGroup()
    ->condition("$field_name.address_line1", NULL, 'IS NULL')
    ->condition("$field_name.address_line1", '');

  $ids = $query
    ->condition("$field_name.country_code", NULL, 'IS NOT NULL')
    ->condition($condition_group)
    // We do not need an access check, as it's a migrator.
    ->accessCheck(FALSE)
    ->execute();

  if (empty($ids)) {
    return 'Found no relevant events to update.';
  }

  $count = count($ids);

  /** @var \Drupal\recurring_events\Entity\EventSeries[]|\Drupal\recurring_events\Entity\EventInstance[] $entities */
  $entities = $storage->loadMultiple($ids);

  foreach ($entities as $entity) {
    $entity->set($field_name, []);
    $entity->save();
  }

  return "Updated $count events, removing country-only address.";
}

/**
 * Unset address data from eventseries that only have countries set.
 *
 * @see _dpl_event_unset_country_only_addresses()
 */
function dpl_event_deploy_migrate_country_eventseries(): string {
  $storage = \Drupal::entityTypeManager()->getStorage('eventseries');
  return _dpl_event_unset_country_only_addresses($storage);
}

/**
 * Unset address data from eventinstances that only have countries set.
 *
 * @see _dpl_event_unset_country_only_addresses()
 */
function dpl_event_deploy_migrate_country_eventinstances(): string {
  $storage = \Drupal::entityTypeManager()->getStorage('eventinstance');
  return _dpl_event_unset_country_only_addresses($storage);
}
