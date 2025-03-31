<?php

namespace Drupal\bnf\Plugin\Traits;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaVideo;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaVideotool;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\media\Entity\Media;
use Spawnia\Sailor\ObjectLike;

/**
 * Helper trait, for dealing with Embedded video fields.
 *
 * We try to look up existing medias, to avoid re-creating them if we can.
 */
trait EmbedVideoTrait {
  use AutowirePluginTrait;

  /**
   * The entity type manager.
   */
  protected EntityTypeManagerInterface $entityTypeManager;

  /**
   * Getting Drupal-ready value from object.
   *
   * @return mixed[]
   *   The value that can be used with Drupal ->set().
   */
  public function getEmbedVideoValue(MediaVideo|MediaVideotool|ObjectLike|null $video): array {
    if (is_null($video)) {
      return [];
    }

    $mediaStorage = $this->entityTypeManager->getStorage('media');

    if (str_ends_with(get_class($video), 'MediaVideo')) {
      $media = $this->getMediaVideoMedia($video, $mediaStorage);
    }
    elseif (str_ends_with(get_class($video), 'MediaVideotool')) {
      $media = $this->getMediaVideoToolMedia($video, $mediaStorage);
    }

    return [
      'target_id' => $media?->id(),
    ];
  }

  /**
   * Finding or creating a Video media.
   */
  private function getMediaVideoMedia(ObjectLike $video, EntityStorageInterface $mediaStorage): ?Media {
    /** @var \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaVideo $video */

    $properties = [
      'bundle' => 'video',
      'name' => $video->name ?? '',
      'field_media_oembed_video' => $video->mediaOembedVideo,
      'status' => TRUE,
    ];

    // Look up existing media - if it exists, referer to that, otherwise create.
    $medias = $mediaStorage->loadByProperties($properties);
    $media = reset($medias);

    if (!($media instanceof Media)) {
      $media = $mediaStorage->create($properties);
      $media->save();
    }

    return ($media instanceof Media) ? $media : NULL;
  }

  /**
   * Finding or creating a VideoTool media.
   */
  private function getMediaVideoToolMedia(ObjectLike $video, EntityStorageInterface $mediaStorage): ?Media {
    /** @var \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaVideotool $video */

    $properties = [
      'bundle' => 'videotool',
      'name' => $video->name ?? '',
      'field_media_videotool' => $video->mediaVideotool,
      'status' => TRUE,
    ];

    // Look up existing media - if it exists, referer to that, otherwise create.
    $medias = $mediaStorage->loadByProperties($properties);
    $media = reset($medias);

    if (!($media instanceof Media)) {
      $media = $mediaStorage->create($properties);
      $media->save();
    }

    return ($media instanceof Media) ? $media : NULL;
  }

}
