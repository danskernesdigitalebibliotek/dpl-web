<?php

declare(strict_types=1);

namespace Drupal\dpl_media\Entity;

/**
 * Bundle class for videotool media.
 */
class VideotoolMedia extends VideotoolBase {

  /**
   * {@inheritdoc}
   */
  public function getVideotoolUrl(): string {
    return $this->get('field_media_videotool')->value;
  }

}
