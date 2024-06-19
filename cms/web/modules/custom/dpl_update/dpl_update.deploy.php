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
