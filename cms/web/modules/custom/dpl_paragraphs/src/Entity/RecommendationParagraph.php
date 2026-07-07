<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\paragraphs\Entity\Paragraph;

/**
 * Bundle class for recommendation paragraphs.
 */
class RecommendationParagraph extends Paragraph {

  /**
   * Get the recommendation work ID.
   */
  public function getWorkId(): ?string {
    return $this->get('field_recommendation_work_id')->value;
  }

  /**
   * Determine if the image is positioned on the right.
   */
  public function isImagePositionRight(): bool {
    return (bool) $this->get('field_image_position_right')->value;
  }

  /**
   * Get the recommendation title.
   */
  public function getRecommendationTitle(): ?string {
    /** @var \Drupal\text\Plugin\Field\FieldType\TextItem $title */
    $title = $this->get('field_recommendation_title');
    $title = (string) $title->processed;

    return empty($title) ? NULL : $title;
  }

  /**
   * Get the recommendation description.
   */
  public function getDescription(): ?string {
    $description = $this->get('field_recommendation_description')->value;

    return empty($description) ? NULL : $description;
  }

}
