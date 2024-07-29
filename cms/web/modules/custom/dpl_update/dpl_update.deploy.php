<?php

use Drupal\collation_fixer\CollationFixer;
use Drupal\drupal_typed\DrupalTyped;
use Drupal\node\NodeInterface;

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
