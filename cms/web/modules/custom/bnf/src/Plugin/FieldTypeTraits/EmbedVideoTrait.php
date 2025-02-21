<?php

namespace Drupal\bnf\Plugin\FieldTypeTraits;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaVideo;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaVideotool;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Helper trait, for dealing with Embedded video fields.
 */
trait EmbedVideoTrait {
  use AutowirePluginTrait;

  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
  ) {
  }

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
      /** @var \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaVideo $video */

      $media = $mediaStorage->create([
        'bundle' => 'video',
        'name' => $video->name ?? '',
        'field_media_oembed_video' => $video->mediaOembedVideo,
      ]);
    }
    elseif (str_ends_with(get_class($video), 'MediaVideotool')) {
      /** @var \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\EmbedVideo\MediaVideotool $video */

      $media = $mediaStorage->create([
        'bundle' => 'videotool',
        'name' => $video->name ?? '',
        'field_media_videotool' => $video->mediaVideotool,
      ]);
    }
    else {
      return [];
    }

    $media->save();

    return [
      'target_id' => $media->id(),
    ];
  }

}
