<?php

use Drupal\collation_fixer\CollationFixer;
use Drupal\Core\Entity\FieldableEntityInterface;
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
 * Helper function, for setting field value on entities content on new fields.
 *
 * This is useful if you have created a new field, and want to set a
 * default value.
 */
function _dpl_update_set_value(string $field_name, mixed $value, string $entity_type = 'node'): string {
  $ids =
    \Drupal::entityQuery($entity_type)
      ->accessCheck(FALSE)
      ->execute();

  if (!is_array($ids) || empty($ids)) {
    return "No $entity_type entities to update.";
  }

  $entities =
    \Drupal::entityTypeManager()->getStorage($entity_type)->loadMultiple($ids);

  $count = 0;

  foreach ($entities as $entity) {
    try {
      if (!($entity instanceof FieldableEntityInterface)) {
        throw new Exception('Entity is not an expected FieldableEntity.');
      }

      $entity->set($field_name, $value);

      $entity->save();
      $count++;
    }
    catch (\Throwable $e) {
      \Drupal::logger('dpl_update')->error('Could not set default value on @field_name on @entity_type @id - Error: @message', [
        '@message' => $e->getMessage(),
        '@entity_type' => $entity_type,
        '@id' => $entity->id(),
        '@field_name' => $field_name,
      ]);
    }
  }

  return "Set default value for $field_name on $count $entity_type.";
}

/**
 * Re-generating missing URL aliases for entity types.
 *
 * Useful, if you've created or altered a new pattern.
 */
function _dpl_update_generate_url_aliases(string $entity_type): string {
  $ids =
    \Drupal::entityQuery($entity_type)
      ->accessCheck(FALSE)
      ->execute();

  if (!is_array($ids) || empty($ids)) {
    return "No $entity_type entities to update.";
  }

  foreach ($ids as $id) {
    $entity = \Drupal::entityTypeManager()->getStorage($entity_type)->load($id);

    \Drupal::service('pathauto.generator')->updateEntityAlias($entity, 'update');
  }

  $count = count($ids);

  return "Updated $count aliased entities of type $entity_type.";
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
 * Migrate values from field_title to field_underlined_title.
 */
function dpl_update_deploy_migrate_content_slider_titles(): string {
  $paragraph_storage = Drupal::entityTypeManager()->getStorage('paragraph');

  $old_field = 'field_title';
  $new_field = 'field_underlined_title';

  $paragraph_ids = Drupal::entityQuery('paragraph')
    ->condition('type', ['content_slider', 'content_slider_automatic'], 'IN')
    ->condition("$old_field.value", "", "<>")
    ->accessCheck(FALSE)
    ->execute();

  if (empty($paragraph_ids)) {
    return "No content sliders found.";
  }

  $paragraph_ids = is_array($paragraph_ids) ? $paragraph_ids : [];
  $paragraphs = $paragraph_storage->loadMultiple($paragraph_ids);

  $updated_titles = [];
  foreach ($paragraphs as $paragraph) {
    /** @var \Drupal\paragraphs\Entity\Paragraph $paragraph */
    if (!$paragraph->hasField($new_field)) {
      continue;
    }

    $old_value = $paragraph->get($old_field)->getString();

    if (!$paragraph->get($new_field)->isEmpty()) {
      continue;
    }

    $paragraph->set($new_field, [
      'value' => $old_value,
      'format' => 'underlined_title',
    ]);
    $paragraph->save();
    $updated_titles[] = $old_value;
  }

  if (empty($updated_titles)) {
    return 'No titles were migrated.';
  }

  $count = count($updated_titles);

  return "Migrated titles ($count): " . implode(', ', $updated_titles);
}

/**
 * Set default value for all existing eventseries:field_relevant_ticket_manager.
 */
function dpl_update_deploy_field_relevant_ticket_manager(): string {
  return _dpl_update_set_value('field_relevant_ticket_manager', TRUE, 'eventseries');
}

/**
 * Re-generating the URL aliases of taxonomy terms.
 *
 * Relevant after we've created "search" overview on the term pages of tags
 * and categories.
 */
function dpl_update_deploy_update_term_url_aliases(): string {
  return _dpl_update_generate_url_aliases('taxonomy_term');
}
