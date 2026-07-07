<?php

declare(strict_types=1);

namespace Drupal\dpl_media\Entity;

use Drupal\file\FileInterface;
use Drupal\media\Entity\Media;

/**
 * Base class for videotool media.
 */
abstract class VideotoolBase extends Media {

  /**
   * Get the video embed url.
   */
  abstract public function getVideotoolUrl(): string;

  /**
   * Get video thumbnail.
   */
  public function getThumbnail(): FileInterface {
    /** @var \Drupal\file\Entity\File|null $file */
    $file = $this->get('thumbnail')->entity;

    if (!$file) {
      // Shouldn't really happen, Drupal ought to ensure that there's always at
      // least a default thumbnail.
      throw new \RuntimeException('No thumbnail on media?');
    }

    return $file;
  }

}
