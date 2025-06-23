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
      $output = $this->buildOutput($item);

      $elements[$delta] = [
        '#markup' => "<small>$output</small>",
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
    $fieldStorageDefinition = $item->getFieldDefinition()->getFieldStorageDefinition();

    $values = $item->getValue();
    $outputs = [];

    if (isset($values['onshelf'])) {
      // On-shelf is a boolean, and we want the value to show that.
      $values['onshelf'] = ($values['onshelf']) ?
        $this->t('Yes') : $this->t('No');
    }

    foreach ($values as $key => $value) {
      $label = $fieldStorageDefinition->getPropertyDefinition($key)?->getLabel();

      if (empty($label) || empty($value)) {
        continue;
      }

      $outputs[] = "<strong>$label:</strong> $value";
    }

    return implode("\r\n<br/>", $outputs);
  }

}
