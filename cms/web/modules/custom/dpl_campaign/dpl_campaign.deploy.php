<?php

use Drupal\media\Entity\Media;
use Drupal\node\NodeInterface;

/**
 * Migrate campaign images from field_campaign_image to field_campaign_media.
 *
 * Creates a media entity for each campaign that has an image in the old
 * field_campaign_image field and assigns it to the new field_campaign_media
 * field, so existing content is preserved after the switch to media library.
 */
function dpl_campaign_deploy_migrate_campaign_images(): string {
  $storage = \Drupal::entityTypeManager()->getStorage('node');

  $campaign_ids = $storage->getQuery()
    ->condition('type', 'campaign')
    ->condition('field_campaign_image', NULL, 'IS NOT NULL')
    ->accessCheck(FALSE)
    ->execute();

  if (!is_array($campaign_ids) || empty($campaign_ids)) {
    return 'No campaigns with images to migrate.';
  }

  /** @var \Drupal\node\NodeInterface[] $campaigns */
  $campaigns = $storage->loadMultiple($campaign_ids);
  $migrated = 0;
  $skipped = 0;

  foreach ($campaigns as $campaign) {
    if (!($campaign instanceof NodeInterface)) {
      continue;
    }

    if (!$campaign->get('field_campaign_media')->isEmpty()) {
      $skipped++;
      continue;
    }

    if ($campaign->get('field_campaign_image')->isEmpty()) {
      continue;
    }

    /** @var \Drupal\image\Plugin\Field\FieldType\ImageItem $image_item */
    $image_item = $campaign->get('field_campaign_image')->first();
    $file_id = $image_item->get('target_id')->getValue();
    $alt = $image_item->get('alt')->getValue() ?? '';

    $media = Media::create([
      'bundle' => 'image',
      'name' => $campaign->getTitle() ?: 'Campaign image',
      'field_media_image' => [
        'target_id' => $file_id,
        'alt' => $alt,
      ],
      'uid' => $campaign->getOwnerId(),
    ]);
    $media->save();

    $campaign->set('field_campaign_media', ['target_id' => $media->id()]);
    $campaign->save();

    $migrated++;
  }

  return "Migrated $migrated campaign image(s) to media entities. Skipped $skipped (already had media).";
}
