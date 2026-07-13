<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\dpl_media\Entity\VideotoolMedia;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Bundle class for go_video paragraphs.
 */
class GoVideoParagraph extends Paragraph {

  /**
   * Get the video title.
   */
  public function getVideoTitle(): ?string {
    return $this->get('field_go_video_title')->value;
  }

  /**
   * Get the video media entity.
   */
  public function getVideoMedia(): VideotoolMedia {
    $medias = $this->get('field_embed_video')->referencedEntities();

    $media = reset($medias);

    if (!$media instanceof VideotoolMedia) {
      throw new \RuntimeException('Required media not found');
    }

    return $media;
  }

}
