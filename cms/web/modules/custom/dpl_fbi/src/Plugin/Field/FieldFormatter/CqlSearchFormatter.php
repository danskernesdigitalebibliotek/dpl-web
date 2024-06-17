<?php

namespace Drupal\dpl_fbi\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;

/**
 * Plugin implementation of the 'cql_search_formatter' formatter.
 *
 * @FieldFormatter(
 *   id = "cql_search_formatter",
 *   label = @Translation("CQL Search Formatter"),
 *   field_types = {
 *     "dpl_fbi_cql_search"
 *   }
 * )
 */
class CqlSearchFormatter extends FormatterBase {

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];

    foreach ($items as $delta => $item) {
      $elements[$delta] = [
        '#markup' => $item->value,
      ];
    }

    return $elements;
  }

}
