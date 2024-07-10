<?php

use Drupal\Core\Entity\FieldableEntityInterface;

/**
 * Set OUTER_AND as value on field_filter_cond_type on existing paragraphs.
 */
function dpl_related_content_deploy_set_filter_cond(): string {
  $storage = \Drupal::entityTypeManager()->getStorage('paragraph');

  $types = ['card_grid_automatic', 'content_slider_automatic', 'filtered_event_list'];

  $pids = $storage->getQuery()
    ->condition('type', $types, 'IN')
    ->accessCheck()
    ->execute();

  $paragraphs = $storage->loadMultiple($pids);

  foreach ($paragraphs as $paragraph) {
    if (!($paragraph instanceof FieldableEntityInterface)) {
      continue;
    }

    try {
      $paragraph->set('field_filter_cond_type', 'outer_and');
      $paragraph->save();
    }
    catch (\Exception $exception) {
      \Drupal::logger('dpl_related_content')->warning($exception->getMessage());
    }
  }

  $count = count($paragraphs);

  return "Set OUTER_AND as value on existing $count paragraphs";
}
