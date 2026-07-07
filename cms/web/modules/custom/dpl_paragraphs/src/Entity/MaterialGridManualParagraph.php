<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\paragraphs\Entity\Paragraph;

/**
 * Bundle class for material_grid_manual paragraphs.
 */
class MaterialGridManualParagraph extends Paragraph {

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
   * Get the work IDs.
   *
   * @return string[]
   *   Work ids.
   */
  public function getWorkIds(): array {
    $workIds = [];

    /** @var \Drupal\dpl_fbi\Plugin\Field\FieldType\WorkIdItem[] $items */
    $items = $this->get('field_material_grid_work_ids');

    foreach ($items as $item) {
      $value = $item->get('value')->getValue();
      if ($value) {
        $workIds[] = $value;
      }
    }

    return $workIds;
  }

}
