<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\dpl_media\Entity\VideotoolMedia;
use Drupal\dpl_media\Entity\VideotoolVerticalMedia;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Base class for automatic Go video bundle paragraphs.
 */
abstract class GoVideoBundleAutomaticBase extends Paragraph {

  /**
   * Get the video title.
   */
  public function getVideoTitle(): string {
    return $this->get('field_go_video_title')->value;
  }

  /**
   * Get the CQL search query.
   */
  public function getCql(): ?string {
    return $this->get('field_cql_search')->value;
  }

  /**
   * Get the limit of materials.
   */
  public function getLimit(): int {
    return (int) $this->get('field_video_amount_of_materials')->value;
  }

  /**
   * Get the video media entity.
   */
  public function getVideoMedia(): VideotoolMedia | VideotoolVerticalMedia | NULL {
    $medias = $this->get('field_embed_video')->referencedEntities();

    $media = reset($medias);

    if (!$media instanceof VideotoolMedia && !$media instanceof VideotoolVerticalMedia) {
      return NULL;
    }

    return $media;
  }

}
