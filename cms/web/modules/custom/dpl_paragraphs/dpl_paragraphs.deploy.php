<?php

/**
 * @file
 * DPL Paragraphs deploy file. hooks will be run *after* config import.
 */

use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\dpl_fbi\Plugin\Field\FieldWidget\CqlSearchWidget;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Migrate work id field.
 *
 * This is copied to specific fields on recommendations and material grids.
 */
function dpl_paragraphs_deploy_migrate_work_ids(): string {
  $migrations = [
    [
      'entity_type' => 'paragraph',
      'type' => 'material_grid_manual',
      'source_field' => 'field_work_id',
      'target_field' => 'field_material_grid_work_ids',
    ],
    [
      'entity_type' => 'paragraph',
      'type' => 'recommendation',
      'source_field' => 'field_work_id',
      'target_field' => 'field_recommendation_work_id',
    ],
  ];

  $status = array_map(function (array $migration) {
    return dpl_paragraphs_migrate_field_value(
      $migration['entity_type'],
      $migration['type'],
      $migration['source_field'],
      $migration['target_field'],
      function (array $value): string {
        return $value['value'] ?? '';
      }
    );
  }, $migrations);

  return implode("\r\n", $status);
}

/**
 * Migrate a single field on an entity.
 *
 * @param string $entity_type
 *   The type of entity e.g. node, paragraph.
 * @param ?string $bundle_type
 *   Optionally the bundle/subtype of the entity - e.g. article, page.
 * @param string $source_field
 *   The machine name of the field to migrate data from.
 * @param string $target_field
 *   The machine name of the field to migrate data to.
 * @param callable(mixed[]): mixed $value_mapper
 *   The function which transforms the value of the source field to the value
 *   of the target field.
 *
 * @return string
 *   The status of the migration. Useful for returning from hook_deploy() or
 *    hook_update()
 */
function dpl_paragraphs_migrate_field_value(string $entity_type, ?string $bundle_type, string $source_field, string $target_field, callable $value_mapper): string {
  $query = \Drupal::entityQuery($entity_type)
    ->condition($source_field, '', '<>')
    ->accessCheck(FALSE);
  if ($bundle_type) {
    $query->condition('type', $bundle_type);
  }
  $ids = $query->execute();

  $entities = \Drupal::entityTypeManager()->getStorage($entity_type)->loadMultiple($ids);

  foreach ($entities as $entity) {
    if (!($entity instanceof FieldableEntityInterface) || !$entity->hasField($target_field)) {
      throw new LogicException("Unable to migrate to field {$target_field} on {$entity_type}:{$bundle_type}. Field is missing");
    }

    $new_values = array_map($value_mapper, $entity->get($source_field)->getValue());

    $entity->set($target_field, $new_values);
    // Do not delete the existing value yet. We preserve this until we are ready
    // to drop the source field entirely.
    $entity->save();
  }

  $num_migrations = count($entities);
  return "Migrated {$num_migrations} {$entity_type}:${bundle_type} from {$source_field} to {$target_field}";
}

/**
 * Migrating and combining material_grid paragraphs to one single.
 *
 * Material_grid_link_automatic is now deprecated and has instead been replaced
 * by material_grid_automatic, that supports both input by link, advanced CQL
 * and search filters.
 *
 * The migrate action finds all these old paragraph types, gets the data,
 * builds a new material_grid_automatic, and sets it in the place of the
 * old paragraph on the parent entity, and deletes the old paragraph.
 */
function dpl_paragraphs_deploy_migrate_material_grid_link(): string {
  $old_paragraph_type = 'material_grid_link_automatic';
  $new_paragraph_type = 'material_grid_automatic';

  // Common fields that exist in both the old and new paragraphs, and does
  // not change IDs.
  $common_fields = [
    'field_amount_of_materials',
    'field_material_grid_description',
    'field_material_grid_title',
  ];

  $storage = \Drupal::entityTypeManager()->getStorage('paragraph');

  // Loading all existing material paragraph types.
  $paragraph_ids = \Drupal::entityQuery('paragraph')
    ->condition('type', $old_paragraph_type)
    // No access check, as this is a migration action.
    ->accessCheck(FALSE)
    ->execute();

  $paragraph_ids = is_array($paragraph_ids) ? $paragraph_ids : [];

  $match_count = count($paragraph_ids);
  $processed_count = 0;

  foreach ($paragraph_ids as $pid) {
    $paragraph = $storage->load($pid);

    if (!($paragraph instanceof Paragraph)) {
      continue;
    }

    // Get the parent entity - for example, the node with the field_paragraphs.
    $parent = $paragraph->getParentEntity();

    if (!($parent instanceof FieldableEntityInterface)) {
      \Drupal::logger('dpl_paragraphs')->error(
        'Could not determine paragraph parent for pid @pid as part of migrating material grids.',
        ['@pid' => $pid]
      );
      continue;
    }

    $parent_field_name = $paragraph->get('parent_field_name')->getString();
    $parent_field = $parent->get($parent_field_name);

    // Looping through the parents paragraph field values, and finding our
    // target paragraph.
    foreach ($parent_field->getValue() as $delta => $item) {
      $target_id = $item['target_id'] ?? NULL;

      if ((int) $target_id !== (int) $pid) {
        continue;
      }

      $values = [];

      foreach ($common_fields as $field) {
        if ($paragraph->hasField($field)) {
          $values[$field] = $paragraph->get($field)->getValue();
        }
      }

      $search_values = [];
      $link = '';

      if ($paragraph->hasField('field_material_grid_link')) {
        $link = $paragraph->get('field_material_grid_link')->getString();

        $search_values['value'] = CqlSearchWidget::getFilter($link, 'advancedSearchCql');
        $search_values['location'] = CqlSearchWidget::getFilter($link, 'location');
        $search_values['sublocation'] = CqlSearchWidget::getFilter($link, 'sublocation');

        $sort_value = CqlSearchWidget::getFilter($link, 'sort');
        $search_values['sort'] = !empty($sort_value) ? $sort_value : 'sort.latestpublicationdate.desc';

        // Onshelf value is a boolean, sent along as a 'true'/'false' string.
        $onshelf_value = (string) CqlSearchWidget::getFilter($link, 'onshelf');
        $search_values['onshelf'] = (strtolower($onshelf_value) === 'true');
      }

      // If for whatever reason a CQL has not been set, we'll log it, and
      // move on. This will most likely happen because
      // there have previously been issues with editors placing invalid links
      // in the link fields.
      if (empty($search_values['value'])) {
        \Drupal::logger('dpl_paragraphs')->error(
          'Paragraph @pid of type @type could not be migrated: CQL could not be determined from link "@link"',
          [
            '@pid' => $pid,
            '@type' => $paragraph->getType(),
            '@link' => $link,
          ]
        );

        continue;
      }

      $new_paragraph = Paragraph::create([
        'type' => $new_paragraph_type,
        'parent_id' => $parent->id(),
        'parent_type' => $parent->getEntityTypeId(),
        'parent_field_name' => $parent_field_name,
        'field_name' => $parent_field_name,
        'field_cql_search' => $search_values,
      ] + $values);
      $new_paragraph->save();

      // Replace old with new in parent field.
      $items = $parent->get($parent_field_name)->getValue();
      $items[$delta]['target_id'] = $new_paragraph->id();
      $items[$delta]['target_revision_id'] = $new_paragraph->getRevisionId();

      $parent->set($parent_field_name, $items);
      $parent->save();

      $paragraph->delete();

      $processed_count++;

    }

  }

  $placeholders = [
    '@old_type' => $old_paragraph_type,
    '@new_type' => $new_paragraph_type,
    '@count' => $processed_count,
    '@total' => $match_count,
  ];

  \Drupal::logger('dpl_paragraphs')->info(
    "Paragraph migration of @old_type to @new_type completed. @count / @total migrated.",
    $placeholders
  );

  return t(
    "Paragraph migration of @old_type to @new_type completed. @count / @total migrated.",
    $placeholders
  )->render();
}

/**
 * Migrate field_amount_of_materials => field_material_amount.
 */
function dpl_paragraphs_deploy_migrate_material_amount(): string {
  $storage = \Drupal::entityTypeManager()->getStorage('paragraph');
  $pids = $storage->getQuery()
    ->condition('field_amount_of_materials', '', '<>')
    ->accessCheck(FALSE)
    ->execute();

  /** @var \Drupal\paragraphs\Entity\Paragraph[] $paragraphs */
  $paragraphs = $storage->loadMultiple($pids);
  $updated_count = 0;

  foreach ($paragraphs as $paragraph) {
    $value = (int) $paragraph->get('field_amount_of_materials')->getString();
    $value = !empty($value) ? $value : 8;

    // Sanity check, that should not apply regardless.
    if (!$paragraph->hasField('field_material_amount')) {
      continue;
    }

    $paragraph->set('field_material_amount', $value);
    $paragraph->save();
    $updated_count++;
  }

  return "Migrated amount-field for $updated_count paragraphs.";
}
