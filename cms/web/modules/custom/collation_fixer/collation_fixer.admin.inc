<?php

/**
 * @file
 * Administrative confirm form for fixing table collation.
 */

/**
 * Page callback for collation fixer confirm form.
 *
 * @see collation_fixer_menu()
 */
function collation_fixer_fix_collation_confirm_form($form, &$form_state, $table) {
  $form['table'] = array(
    '#type' => 'value',
    '#value' => check_plain($table),
  );

  return confirm_form(
    $form,
    t('Fix collation of table: @table', array('@table' => $table)),
    'admin/reports/status'
  );
}

/**
 * Submit handler for collation_fixer_fix_collation_confirm_form().
 *
 * @see collation_fixer_fix_collation_confirm_form
 */
function collation_fixer_fix_collation_confirm_form_submit($form, &$form_state) {
  $table = $form_state['values']['table'];

  if (collation_fixer_fix_collation($table)) {
    drupal_set_message());
  };
  drupal_goto('admin/reports/status');
}
