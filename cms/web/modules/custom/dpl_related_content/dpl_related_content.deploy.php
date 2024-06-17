<?php

/**
 * @file
 * Deploy hooks.
 *
 * These get run AFTER config-import.
 */

use Drupal\paragraphs\Entity\Paragraph;

/**
 * Port values from field_amount_of_events => field_max_item_amount.
 */
function dpl_related_content_deploy_port_amount_item(): string {
  $source_field = 'field_amount_of_events';
  $target_field = 'field_max_item_amount';

  $ids =
    \Drupal::entityQuery('paragraph')
      ->condition('type', 'filtered_event_list')
      ->accessCheck(FALSE)
      ->execute();

  if (empty($ids) || is_int($ids)) {
    return 'No entities to update.';
  }

  $entities =
    \Drupal::entityTypeManager()->getStorage('paragraph')->loadMultiple($ids);

  foreach ($entities as $entity) {
    if (!($entity instanceof Paragraph) || !$entity->hasField($source_field) || !$entity->hasField($target_field)) {
      continue;
    }

    $value = $entity->get($source_field)->getString();
    $entity->set($target_field, $value);
    $entity->set($source_field, NULL);
    $entity->save();
  }

  return t("Updated @count entities, @source_field => @target_field", [
    "@count" => count($entities),
    "@source_field" => $source_field,
    "@target_field" => $target_field,
  ])->render();

}
