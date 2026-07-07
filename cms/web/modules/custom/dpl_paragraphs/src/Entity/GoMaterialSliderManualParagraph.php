<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\paragraphs\Entity\Paragraph;

/**
 * Bundle class for go_material_slider_manual paragraphs.
 */
class GoMaterialSliderManualParagraph extends Paragraph {

  /**
   * Get the slider title.
   */
  public function getSliderTitle(): ?string {
    return $this->get('field_title')->value;
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
    $items = $this->get('field_material_slider_work_ids');

    foreach ($items as $item) {
      $value = $item->get('value')->getValue();
      if ($value) {
        $workIds[] = $value;
      }
    }

    return $workIds;
  }

}
