<?php

declare(strict_types=1);

namespace Drupal\dpl_media\Entity;

use Drupal\Core\Entity\Attribute\Bundle;
use Drupal\media\Entity\Media;

/**
 * Bundle class for video media.
 */
#[Bundle(
  entityType: 'media',
  bundle: 'video',
)]
class VideoMedia extends Media {
  // Currently just used for typing. Remove this comment when adding getters.
}
