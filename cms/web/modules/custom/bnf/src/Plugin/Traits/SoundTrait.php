<?php

namespace Drupal\bnf\Plugin\Traits;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\CategoryMenuSound\MediaAudio;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\media\Entity\Media;
use Spawnia\Sailor\ObjectLike;

/**
 * Helper trait, for dealing with sound media fields.
 */
trait SoundTrait {

  use FileTrait;
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
  public function getSoundValue(null|MediaAudio|ObjectLike $audio): array {
    if (is_null($audio)) {
      return [];
    }

    /** @var \Drupal\bnf\GraphQL\Operations\GetNode\Node\CategoryMenuSound\MediaAudio $audio */
    $file = $this->createFile($audio->mediaAudioFile->url);

    $mediaStorage = $this->entityTypeManager->getStorage('media');

    $properties = [
      'bundle' => 'audio',
      'name' => $file->getFilename(),
      'status' => TRUE,
      'field_media_audio_file' => [
        'target_id' => $file->id(),
      ],
    ];

    // Look up existing media - if it exists, referer to that, otherwise create.
    $medias = $mediaStorage->loadByProperties($properties);
    $media = reset($medias);

    if (!($media instanceof Media)) {
      $media = $mediaStorage->create($properties);
      $media->save();
    }

    return ['target_id' => $media->id()];
  }

}
