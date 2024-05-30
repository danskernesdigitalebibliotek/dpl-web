<?php

/**
 * @file
 * Admin deploy hooks.
 *
 * These get run AFTER config-import.
 */

use Drupal\collation_fixer\CollationFixer;
use Drupal\drupal_typed\DrupalTyped;
use Drupal\node\NodeInterface;

/**
 * We've limited the text formats for CKEditor fields. Let's move old to new.
 */
function dpl_admin_deploy_set_allowed_textformat() : string {
  $message = dpl_admin_set_allowed_textformat_helper('field_body', 'text_body');
  $message .= dpl_admin_set_allowed_textformat_helper('field_hero_description', 'hero');

  return $message;
}

/**
 * {@inheritDoc}
 */
function dpl_admin_set_allowed_textformat_helper(string $field_name, string $type): string {
  $pids =
    \Drupal::entityQuery('paragraph')
      ->condition('type', $type)
      ->condition($field_name, '', '<>')
      ->accessCheck(FALSE)
      ->execute();

  $pids = is_array($pids) ? $pids : [];

  $paragraphs = \Drupal::entityTypeManager()->getStorage('paragraph')->loadMultiple($pids);

  foreach ($paragraphs as $paragraph) {
    /** @var \Drupal\paragraphs\Entity\Paragraph $paragraph */

    $values = $paragraph->get($field_name)->getValue();

    foreach ($values as &$value) {
      $value['format'] = 'basic';
    }

    $paragraph->set($field_name, $values);
    $paragraph->save();
  }

  return t(
    '@field_name has been set to basic format on @count paragraphs of type @type',
    [
      '@field_name' => $field_name,
      '@type' => $type,
      '@count' => count($paragraphs),
    ])->render();
}

/**
 * Set a logical default for config_ignore_auto.settings.
 */
function dpl_admin_deploy_set_config_auto(): string {
  $config_factory = \Drupal::configFactory();
  $config = $config_factory->getEditable('config_ignore_auto.settings');
  $config->set('ignored_config_entities', []);
  $config->save(TRUE);

  return 'config_ignore_auto.settings.ignored_config_entities has been reset.';
}

/**
 * Fix collation for all tables to fix alphabetical sorting.
 */
function dpl_admin_deploy_fix_collation(): string {
  if (!\Drupal::moduleHandler()->moduleExists('collation_fixer')) {
    return "No table collations fixed. collation_fixer module is not enabled.";
  }
  $collation_fixer = DrupalTyped::service(CollationFixer::class, 'collation_fixer.collation_fixer');
  $collation_fixer->fixCollation();
  return "Fixed collation for all tables";
}

/**
 * Set branches without value to not promoted on lists.
 */
function dpl_admin_deploy_set_branches_not_promoted(): string {
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
