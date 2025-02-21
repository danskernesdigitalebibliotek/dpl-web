<?php

namespace Drupal\bnf\Plugin\FieldTypeTraits;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Medias\MediaImage;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Helper trait, for dealing with image fields.
 */
trait ImageTrait {

  use FileTrait;
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
  public function getImageValue(null|MediaImage|ObjectLike $image): array {
    if (is_null($image)) {
      return [];
    }

    /** @var \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Medias\MediaImage $image */
    $file = $this->createFile($image->mediaImage->url);
    $alt = $image->mediaImage->alt;

    $mediaStorage = $this->entityTypeManager->getStorage('media');

    // Create the media entity.
    $media = $mediaStorage->create([
      'bundle' => 'image',
      'name' => $file->getFilename(),
      'status' => TRUE,
      'field_media_image' => [
        'target_id' => $file->id(),
        'alt' => $alt,
      ],
    ]);
    $media->save();

    return ['target_id' => $media->id()];
  }

}
