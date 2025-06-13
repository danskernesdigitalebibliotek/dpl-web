<?php

/**
 * @file
 * Deploy hooks.
 *
 * These get run AFTER config-import.
 */

use Drupal\dpl_media_cleanup\Services\MediaCleanup;
use Drupal\drupal_typed\DrupalTyped;
use Drupal\media\Entity\Media;

/**
 * Find duplicate medias, and hide them in the media library.
 *
 * As part of a bug, all medias pulled from Delingstjenesten/BNF were duplicated
 * resulting in a bloated media library.
 *
 * @param array<mixed> $sandbox
 *   The sandbox, used for batch processing.
 */
function dpl_media_cleanup_deploy_archive(array &$sandbox): string {
  $service = DrupalTyped::service(MediaCleanup::class, 'dpl_media_cleanup');

  // Amount of medias we want to handle per sandbox batch.
  $batch_size = 50;

  // Initialize sandbox values, that we will use as part of batch.
  if (!isset($sandbox['ids'])) {
    $media_ids = $service->getDuplicateOrphanedMediaIds();
    $sandbox['ids'] = $media_ids;
    $sandbox['total'] = count($media_ids);
    $sandbox['current'] = 0;
  }

  if (empty($sandbox['total'])) {
    $sandbox['#finished'] = 1;
    return 'No orphaned media duplicates found.';
  }

  // Slice the current batch from stored IDs, breaking it into batches.
  $batch_ids = array_slice($sandbox['ids'], $sandbox['current'], $batch_size);
  $medias = Media::loadMultiple($batch_ids);

  // Looping through the medias, and hiding it from the media-library.
  foreach ($medias as $media) {
    $service->archiveMedia($media);
    $sandbox['current']++;
  }

  // Progress feedback, used for looping through batches.
  $sandbox['#finished'] = $sandbox['current'] >= $sandbox['total']
    ? 1 : ($sandbox['current'] / $sandbox['total']);

  if ($sandbox['#finished'] === 1) {
    \Drupal::logger('dpl_media_cleanup')->notice(
      'Finished archiving duplicated, orphaned medias.'
    );

    return 'Finished archiving duplicated, orphaned medias.';
  }

  return "Archived {$sandbox['current']}/{$sandbox['total']} duplicate medias.";
}
