<?php

/**
 * @file
 * DPL Paragraphs deploy file. hooks will be run *after* config import.
 */

use Drupal\Core\Entity\FieldableEntityInterface;

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
