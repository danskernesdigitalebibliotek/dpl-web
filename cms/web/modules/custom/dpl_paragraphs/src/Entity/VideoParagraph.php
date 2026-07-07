<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\dpl_media\Entity\Video as MediaVideo;
use Drupal\dpl_media\Entity\Videotool;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Bundle class for video paragraphs.
 */
class VideoParagraph extends Paragraph {

  /**
   * Get the video media entity.
   */
  public function getVideoMedia(): MediaVideo | VideoTool {
    $medias = $this->get('field_embed_video')->referencedEntities();

    $media = reset($medias);

    if (!$media instanceof MediaVideo && !$media instanceof Videotool) {
      throw new \RuntimeException('Required media not found');
    }

    return $media;
  }

}
