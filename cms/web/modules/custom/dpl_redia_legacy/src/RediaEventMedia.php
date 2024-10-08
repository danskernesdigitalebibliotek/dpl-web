<?php

namespace Drupal\dpl_redia_legacy;

use Drupal\Core\Controller\ControllerBase;
use Drupal\file\FileInterface;
use Drupal\image\ImageStyleInterface;
use Drupal\media\MediaInterface;
use function Safe\filesize;
use function Safe\getimagesize;

/**
 * A media object, containing the properties the RSS feed needs.
 */
class RediaEventMedia extends ControllerBase {
  // We'll disable the documentation rules for the member properties, as
  // they are pretty self-explanatory.
  // phpcs:disable
  public ?string $url = NULL;
  public ?int $size = NULL;
  public ?int $width = NULL;
  public ?int $height = NULL;
  public ?string $type = NULL;
  public ?string $md5 = NULL;
  public string $medium = 'image';
  // phpcs:enable

  public function __construct(MediaInterface $media, string $image_style) {
    $file_field_name = 'field_media_image';

    if (!$media->hasField($file_field_name)) {
      return;
    }

    // @phpstan-ignore-next-line PHPStan does not know that entity is available.
    $file = $media->get($file_field_name)->first()?->entity;

    if (!($file instanceof FileInterface)) {
      return;
    }

    $file_uri = $file->getFileUri();
    $style = $this->entityTypeManager()->getStorage('image_style')->load($image_style);

    if (empty($file_uri) || !($style instanceof ImageStyleInterface)) {
      return;
    }

    $image_url = $style->buildUrl($file_uri);
    $image_sizes = getimagesize($file_uri);
    $file_size = filesize($file_uri);

    $image_type = $image_sizes[2] ?? NULL;

    if ($image_type) {
      $this->type = image_type_to_mime_type($image_type);
    }

    $this->url = $image_url;
    $this->size = filesize($file_uri);
    $this->width = $image_sizes[0] ?? NULL;
    $this->height = $image_sizes[1] ?? NULL;
    $this->md5 = md5($image_url . $file_size);
  }

}
