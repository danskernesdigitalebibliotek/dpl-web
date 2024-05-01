<?php

/**
 * @file
 * Admin deploy hooks.
 *
 * These get run AFTER config-import.
 */

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
