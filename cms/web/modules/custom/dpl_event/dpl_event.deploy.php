<?php

/**
 * @file
 * Event deploy hooks.
 *
 * These get run AFTER config-import.
 */

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\dpl_event\Entity\EventInstance;
use Drupal\drupal_typed\DrupalTyped;
use Drupal\gsearch\Services\Gsearch;
use Drupal\recurring_events\Entity\EventSeries;
use function Safe\preg_replace;

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
 * Copy a single entity's address data into field_event_address_gsearch.
 *
 * For Danish addresses we attempt a GSearch lookup to enrich the value with
 * canonical address data (incl. GPS coords). On any failure we fall back to
 * storing the raw user input as free-text.
 */
function _dpl_event_migrate_event_to_gsearch(EventInstance|EventSeries $entity, string $field_name): void {
  if (!$entity->hasField($field_name) || $entity->get($field_name)->isEmpty()) {
    return;
  }

  $value = $entity->get($field_name)->first()?->getValue();

  if (empty($value)) {
    return;
  }

  $country = $value['country_code'] ?? '';
  $address_line1 = $value['address_line1'] ?? '';
  $address_line2 = $value['address_line2'] ?? '';
  $address_line3 = $value['address_line3'] ?? '';
  $postal_code = $value['postal_code'] ?? '';
  $postal_name = $value['locality'] ?? '';
  $address = '';

  if (!empty($address_line1)) {
    $address .= "$address_line1, ";
  }

  if (!empty($address_line2)) {
    $address .= "$address_line2, ";
  }

  if (!empty($address_line3)) {
    $address .= "$address_line3, ";
  }

  // Remove trailing spaces, and any duplicate whitespace characters.
  $address = preg_replace('/\s+/', ' ', trim($address));

  $user_input = "$address $postal_code $postal_name";
  // Remove trailing spaces, and any duplicate whitespace characters.
  $user_input = preg_replace('/\s+/', ' ', trim($user_input));

  if (empty($user_input)) {
    return;
  }

  $new_value = [
    'value' => $user_input,
    'user_input' => $user_input,
    'address' => $address,
    'postal_code' => $postal_code,
    'postal_name' => $postal_name,
    'country_code' => $country,
  ];

  // If the country is DK, we can attempt to look up proper values using
  // GSearch. If it succeeds, we will get more info, such as GPS coords.
  // If this fails, we'll default to the set values as free-text.
  if ($country === 'DK') {
    try {
      $service = DrupalTyped::service(Gsearch::class, 'gsearch.address');
      $gsearch_value = $service->getFieldValue($user_input);
      $gsearch_value_string = $gsearch_value['value'];

      // We'll do a pretty strict look up, as this is a migrator.
      // Worst case, it'll be treated as a free-text field, which is better
      // than accidentally adding a wrong address to an event.
      if (str_starts_with($gsearch_value_string, $address) &&
          str_ends_with($gsearch_value_string, "$postal_code $postal_name")) {
        $new_value = $gsearch_value;
      }
    }
    catch (\Exception) {
      // It's not a problem if it fails, as we have a fall-back.
    }
  }

  $entity->set('field_event_address_gsearch', $new_value);
  $entity->save();
}

/**
 * Run the field_event_address → field_event_address_gsearch migration.
 *
 * @see _dpl_event_migrate_event_to_gsearch()
 */
function _dpl_event_migrate_events_to_gsearch(EntityStorageInterface $storage): string {
  $field_name = 'field_event_address';

  $ids = $storage->getQuery()
    ->condition("$field_name.country_code", NULL, 'IS NOT NULL')
    // We do not need an access check, as it's a migrator.
    ->accessCheck(FALSE)
    ->execute();

  if (empty($ids)) {
    return 'Found no relevant events to update.';
  }

  $count = count($ids);

  /** @var \Drupal\recurring_events\Entity\EventSeries[]|EventInstance[] $entities */
  $entities = $storage->loadMultiple($ids);

  foreach ($entities as $entity) {
    _dpl_event_migrate_event_to_gsearch($entity, $field_name);
  }

  return "Updated $count events, migrating address-field to gsearch fields.";
}

/**
 * Copy data from field_event_address to field_event_address_gsearch (series).
 *
 * @see _dpl_event_migrate_events_to_gsearch()
 */
function dpl_event_deploy_migrate_gsearch_eventseries(): string {
  $storage = \Drupal::entityTypeManager()->getStorage('eventseries');
  return _dpl_event_migrate_events_to_gsearch($storage);
}

/**
 * Copy data from field_event_address to field_event_address_gsearch (instance).
 *
 * @see _dpl_event_migrate_events_to_gsearch()
 */
function dpl_event_deploy_migrate_gsearch_eventinstance(): string {
  $storage = \Drupal::entityTypeManager()->getStorage('eventinstance');
  return _dpl_event_migrate_events_to_gsearch($storage);
}

/**
 * Fix non-online instances that accidentally have an overriding place.
 *
 * We have logic in dpl_event.module, that sets a single space in
 * field_event_place to override data from the series.
 * This should only happen when the instance it self was set to being "online",
 * but due to a bug, it happened also when set to "none".
 *
 * This migrate cleans up those instances that never should have been overriden.
 */
function dpl_event_deploy_migrate_event_place(): string {
  $storage = \Drupal::entityTypeManager()->getStorage('eventinstance');
  $query = $storage->getQuery();
  $place_field_name = 'field_event_place';

  // Exclude online events. A plain "<> 'online'" condition would drop every
  // instance where the field is empty (NULL <> 'online' is NULL, not TRUE),
  // so we also accept instances where the field is not set at all.
  $not_online = $query->orConditionGroup()
    ->condition("field_event_location_type", 'online', '<>')
    ->notExists("field_event_location_type");

  $ids = $query
    ->condition($place_field_name, " ")
    ->condition($not_online)
    // We do not need an access check, as it's a migrator.
    ->accessCheck(FALSE)
    ->execute();

  /** @var \Drupal\dpl_event\Entity\EventInstance[] $events */
  $events = $storage->loadMultiple($ids);

  foreach ($events as $event) {
    $event->set($place_field_name, NULL);
    $event->save();
  }

  $count = count($ids);

  return "Updated $count events, migrating wrongly-overriden place fields.";
}
