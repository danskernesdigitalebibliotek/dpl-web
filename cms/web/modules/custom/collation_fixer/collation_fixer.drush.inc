<?php

/**
 * @file
 * Drush commands.
 */

/**
 * Implements hook_drush_command().
 */
function collation_fixer_drush_command() {

  $items['collation-fixer'] = array(
    'description' => 'Collation table fixer.',
    'options' => array(
      'table' => array(
        'description' => 'Name of a table to fix collation on. Defaults to all tables.',
        'example-value' => 'node',
      ),
      'size' => array(
        'description' => 'The number of tables to process in a single batch request.',
        'example-value' => '50',
      ),
    ),
  );

  return $items;
}

/**
 * Drush command: collation fixer.
 */
function drush_collation_fixer() {

  $table = drush_get_option('table', NULL);
  $batch_size = drush_get_option('size', 50);

  $list = collation_fixer_check_collation($table);
  $chunks = array_chunk($list, $batch_size);

  $total = count($list);

  if ($total > 0) {
    $progress = 0;
    $operations = array();
    foreach ($chunks as $chunk) {
      $progress += count($chunk);

      $operations[] = array('_drush_collation_fixer_process_batch', array(
        $chunk,
        dt('@percent% (Processing @progress of @total)', array(
          '@percent' => round(100 * $progress / $total),
          '@progress' => $progress,
          '@total' => $total,
        )),
      ),
      );
    }

    $batch = array(
      'operations' => $operations,
      'title' => dt('Collation fixer process batch'),
      'finished' => '_drush_collation_fixer_process_batch_finished',
      'progress_message' => dt('@current tables of @total were processed.'),
    );

    // Get the batch process all ready!
    batch_set($batch);

    // Start processing the batch operations.
    drush_backend_batch_process();
  }
  else {
    drush_log('No collation fixes needs to be done', 'ok');
  }
}

/**
 * Batch process: collation fixer.
 */
function _drush_collation_fixer_process_batch($chunk, $details, &$context) {
  $context['message'] = $details;
  // Make sure to only initialize the results the first time.
  if (!isset($context['results']['success'])) {
    $context['results']['success'] = $context['results']['error'] = 0;
  }
  foreach ($chunk as $item) {
    $success = _drush_collation_fixer_process_batch_task($item);
    $success ? $context['results']['success']++ : $context['results']['error']++;
  }
}

/**
 * Batch process task: collation fixer.
 *
 * @return bool
 *   TRUE if collations where changed successfully.
 */
function _drush_collation_fixer_process_batch_task($item) {
  return collation_fixer_fix_collation($item);
}

/**
 * Batch process finished: collation fixer.
 */
function _drush_collation_fixer_process_batch_finished($success, $results, $operations) {
  if ($success) {
    // Let the user know we have finished.
    drush_log(dt('@succeeded tables were successfully processed. @errored tables failed.', array(
      '@succeeded' => empty($results['success']) ? 0 : $results['success'],
      '@errored' => empty($results['error']) ? 0 : $results['error'],
    )), 'ok');
  }
}
