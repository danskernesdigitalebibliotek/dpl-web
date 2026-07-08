<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\paragraphs\Entity\Paragraph;

/**
 * Bundle class for go_material_slider_automatic paragraphs.
 */
class GoMaterialSliderAutomaticParagraph extends Paragraph {

  /**
   * Get the slider title.
   */
  public function getSliderTitle(): ?string {
    return $this->get('field_title')->value;
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
    return (int) $this->get('field_slider_amount_of_materials')->value;
  }

}
