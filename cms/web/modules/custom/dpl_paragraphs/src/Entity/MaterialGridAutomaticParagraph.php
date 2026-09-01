<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\paragraphs\Entity\Paragraph;

/**
 * Bundle class for material_grid_automatic paragraphs.
 */
class MaterialGridAutomaticParagraph extends Paragraph {

  /**
   * Get the grid title.
   */
  public function getGridTitle(): ?string {
    return $this->get('field_material_grid_title')->value;
  }

  /**
   * Get the grid description.
   */
  public function getGridDescription(): ?string {
    return $this->get('field_material_grid_description')->value;
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
    return (int) $this->get('field_material_amount')->value;
  }

  /**
   * Get the priority material type.
   */
  public function getPriorityMaterialType(): ?string {
    return $this->get('field_priority_material_type')->value;
  }

}
