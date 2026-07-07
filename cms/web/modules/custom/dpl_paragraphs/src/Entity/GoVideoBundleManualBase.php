<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\dpl_media\Entity\Videotool;
use Drupal\dpl_media\Entity\VideotoolVertical;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Base class for manual Go video bundle paragraphs.
 */
abstract class GoVideoBundleManualBase extends Paragraph {

  /**
   * Get the title of the video.
   */
  public function getVideoTitle(): string {
    return $this->get('field_go_video_title')->value;
  }

  /**
   * Get the work IDs.
   *
   * @return string[]
   *   Work ids.
   */
  public function getWorkIds(): array {
    $workIds = [];

    /** @var \Drupal\dpl_fbi\Plugin\Field\FieldType\WorkIdItem[] $items */
    $items = $this->get('field_video_bundle_work_ids');
    foreach ($items as $item) {
      $workIds[] = $item->get('value')->getValue();
    }

    return $workIds;
  }

  /**
   * Get the video media entity.
   */
  public function getVideoMedia(): VideoTool | VideotoolVertical {
    $medias = $this->get('field_embed_video')->referencedEntities();

    $media = reset($medias);

    if (!$media instanceof Videotool && !$media instanceof VideotoolVertical) {
      throw new \RuntimeException('Required media not found');
    }

    return $media;
  }

}
