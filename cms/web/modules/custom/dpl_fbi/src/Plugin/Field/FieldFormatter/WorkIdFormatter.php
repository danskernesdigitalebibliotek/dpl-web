<?php

namespace Drupal\dpl_fbi\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;

/**
 * Plugin implementation of the 'work_id_formatter' formatter.
 *
 * @FieldFormatter(
 *   id = "work_id_formatter",
 *   label = @Translation("Work ID Formatter"),
 *   field_types = {
 *     "dpl_fbi_work_id"
 *   }
 * )
 */
class WorkIdFormatter extends FormatterBase {

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];

    foreach ($items as $delta => $item) {
      $output = $this->buildOutput($item);
      $elements[$delta] = [
        '#markup' => $output,
      ];
    }

    return $elements;
  }

  /**
   * Builds the output for a single field item.
   *
   * @param \Drupal\Core\Field\FieldItemInterface $item
   *   The field item.
   *
   * @return string
   *   The rendered output.
   */
  protected function buildOutput($item) {
    $value = $item->get('value')->getValue();
    $material_type = $item->get('material_type')->getValue();
    $output = $value;
    if (!empty($material_type)) {
      $output .= ' (' . $material_type . ')';
    }
    return $output;
  }

}
