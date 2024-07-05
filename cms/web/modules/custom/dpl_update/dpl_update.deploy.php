<?php

use Drupal\collation_fixer\CollationFixer;
use Drupal\drupal_typed\DrupalTyped;
use Drupal\node\NodeInterface;
use Drupal\recurring_events\Entity\EventInstance;
use Drupal\recurring_events\Entity\EventSeries;

/**
 * Linking new field inheritances with existing eventinstances.
 *
 * There is a fault in field_inheritance, when you add new fields/inheritances,
 * it doesn't get updated on the old eventinstances until they get saved from
 * the form.
 * This is because the logic that links eventinstances and eventseries together
 * is set by field_inheritance directly in the form_alter and form_submit.
 * This helper function allows you to pass along a name of a field inherited
 * field that has been set up at /admin/structure/field_inheritance, and
 * the helper will find all eventinstances and make sure the new field is
 * linked together with the relevant eventseries.
 */
function _dpl_update_field_inheritance(string $field_inheritance_name): string {
  $ids =
    \Drupal::entityQuery('eventinstance')
      ->accessCheck(FALSE)
      ->execute();

  if (empty($ids) || is_int($ids)) {
    return 'No entities to update.';
  }

  $entities =
    \Drupal::entityTypeManager()->getStorage('eventinstance')->loadMultiple($ids);

  $count = 0;

  foreach ($entities as $entity) {
    try {
      if (!($entity instanceof EventInstance)) {
        throw new Exception('Entity is not an expected EventInstance.');
      }

      $event_series = $entity->getEventSeries();

      if (!($event_series instanceof EventSeries)) {
        throw new Exception('Entity parent is not an expected EventSeries.');
      }

      // This matches the key that is defined in field_inheritance.
      $state_key = $entity->getEntityTypeId() . ':' . $entity->uuid();
      $field_inheritance = \Drupal::keyValue('field_inheritance')->get($state_key);

      // In theory, an eventinstance could be set up to inherit from another
      // entity than the eventseries - but in practice, this is really unlikely,
      // and something we're willing to disregard.
      $field_inheritance[$field_inheritance_name] = [
        'entity' => $event_series->id(),
      ];

      \Drupal::keyValue('field_inheritance')->set($state_key, $field_inheritance);

      $entity->save();
      $count++;
    }
    catch (\Throwable $e) {
      \Drupal::logger('dpl_update')->error('Could not update field_inheritance on eventinstance @id - Error: @message', [
        '@message' => $e->getMessage(),
        '@id' => $entity->id(),
      ]);
    }
  }

  return "Updated $count eventinstances, linking field  '$field_inheritance_name' to inherit from eventseries.";
}

/**
 * Fix collation for all tables to fix alphabetical sorting.
 */
function dpl_update_deploy_fix_collation(): string {
  if (!\Drupal::moduleHandler()->moduleExists('collation_fixer')) {
    return "No table collations fixed. collation_fixer module is not enabled.";
  }
  $collation_fixer = DrupalTyped::service(CollationFixer::class, CollationFixer::class);
  $collation_fixer->fixCollation();
  return "Fixed collation for all tables";
}

/**
 * Set branches without value to not promoted on lists.
 */
function dpl_update_deploy_set_branches_not_promoted(): string {
  $branches = \Drupal::entityTypeManager()->getStorage('node')->loadByProperties(
    ['type' => 'branch'],
  );
  $branches_with_empty_promotion_fields = array_filter(
    $branches,
    fn(NodeInterface $branch) => $branch->get('field_promoted_on_lists')->isEmpty()
  );
  array_map(
    fn(NodeInterface $branch) => $branch->set('field_promoted_on_lists', 0)->save(),
    $branches_with_empty_promotion_fields
  );

  $count_branches = count($branches_with_empty_promotion_fields);
  return "Set default value for promoted on lists for {$count_branches} branches";
}

/**
 * Set default value for all existing eventseries:field_relevant_ticket_manager.
 */
function dpl_update_deploy_field_relevant_ticket_manager(): string {
  $field_name = 'field_relevant_ticket_manager';

  $ids =
    \Drupal::entityQuery('eventseries')
      ->accessCheck(FALSE)
      ->execute();

  if (empty($ids) || is_int($ids)) {
    return 'No eventseries to update.';
  }

  $entities =
    \Drupal::entityTypeManager()->getStorage('eventseries')->loadMultiple($ids);

  $count = 0;

  foreach ($entities as $entity) {
    try {
      if (!($entity instanceof EventSeries)) {
        throw new Exception('Entity is not an expected EventSeries.');
      }

      $entity->set($field_name, TRUE);

      $entity->save();
      $count++;
    }
    catch (\Throwable $e) {
      \Drupal::logger('dpl_update')->error('Could not set default value on @field_name on eventseries @id - Error: @message', [
        '@message' => $e->getMessage(),
        '@id' => $entity->id(),
        '@field_name' => $field_name,
      ]);
    }
  }

  return "Set default value for $field_name on $count eventseries.";
}

/**
 * Link new event_relevant_ticket_manager inheritance on eventinstances.
 */
function dpl_update_deploy_field_relevant_ticket_manager_inheritance(): string {
  return _dpl_update_field_inheritance('event_relevant_ticket_manager');
}
