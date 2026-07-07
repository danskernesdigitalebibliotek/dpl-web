<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\dpl_media\Entity\VideoMedia;
use Drupal\dpl_media\Entity\VideotoolMedia;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Bundle class for video paragraphs.
 */
class VideoParagraph extends Paragraph {

  /**
   * Get the video media entity.
   */
  public function getVideoMedia(): VideoMedia | VideotoolMedia {
    $medias = $this->get('field_embed_video')->referencedEntities();

    $media = reset($medias);

    if (!$media instanceof VideoMedia && !$media instanceof VideotoolMedia) {
      throw new \RuntimeException('Required media not found');
    }

    return $media;
  }

}
