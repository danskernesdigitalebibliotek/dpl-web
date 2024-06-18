<?php

/**
 * @file
 * Deploy hooks.
 *
 * These get run AFTER config-import.
 */

use Drupal\paragraphs\Entity\Paragraph;

/**
 * Port existing automatic paragraphs to only pull articles.
 *
 * This is the default functionality in the past, but now it is a functionality
 * that the editor can choose.
 */
function dpl_filter_paragraphs_deploy_port_automatic_defaults(): string {
  $ids =
    \Drupal::entityQuery('paragraph')
      ->condition('type', 'card_grid_automatic')
      ->accessCheck(FALSE)
      ->execute();

  if (empty($ids) || is_int($ids)) {
    return 'No entities to update.';
  }

  $entities =
    \Drupal::entityTypeManager()->getStorage('paragraph')->loadMultiple($ids);

  foreach ($entities as $entity) {
    if (!($entity instanceof Paragraph)) {
      continue;
    }

    $entity->set('field_filter_content_types', ['article']);
    $entity->save();
  }

  return t("Updated @count automatic paragraphs, setting 'article' as CT default.", [
    "@count" => count($entities),
  ])->render();

}

/**
 * Port values from field_amount_of_events => field_max_item_amount.
 */
function dpl_filter_paragraphs_deploy_port_amount_item(): string {
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
