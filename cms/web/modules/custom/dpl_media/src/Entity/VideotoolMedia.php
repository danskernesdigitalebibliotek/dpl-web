<?php

declare(strict_types=1);

namespace Drupal\dpl_media\Entity;

use Drupal\Core\Entity\Attribute\Bundle;

/**
 * Bundle class for videotool media.
 */
#[Bundle(
  entityType: 'media',
  bundle: 'videotool',
)]
class VideotoolMedia extends VideotoolBase {

  /**
   * {@inheritdoc}
   */
  public function getVideotoolUrl(): string {
    return $this->get('field_media_videotool')->value;
  }

}
