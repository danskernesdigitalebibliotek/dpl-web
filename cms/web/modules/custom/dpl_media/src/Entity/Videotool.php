<?php

declare(strict_types=1);

namespace Drupal\dpl_media\Entity;

use Drupal\file\FileInterface;
use Drupal\media\Entity\Media;

/**
 * Bundle class for videotool media.
 */
class Videotool extends Media {

  /**
   * Get the video embed url.
   */
  public function getVideotoolUrl(): string {
    return $this->get('field_media_videotool')->value;
  }

  /**
   * Get video thumbnail.
   */
  public function getThumbnail(): FileInterface {
    /** @var \Drupal\file\Entity\File $file */
    $file = $this->get('thumbnail')->entity;

    return $file;
  }

}
