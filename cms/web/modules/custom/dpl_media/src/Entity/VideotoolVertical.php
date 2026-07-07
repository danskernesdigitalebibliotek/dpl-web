<?php

declare(strict_types=1);

namespace Drupal\dpl_media\Entity;

/**
 * Bundle class for videotool_vertical media.
 */
class VideotoolVertical extends VideotoolBase {

  /**
   * {@inheritdoc}
   */
  public function getVideotoolUrl(): string {
    return $this->get('field_media_videotool_vertical')->value;
  }

}
