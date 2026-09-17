<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_field_converter;

use Drupal\bnf\Attribute\FieldConverter;
use Drupal\Core\Field\FieldItemListInterface;

/**
 * Field converter for text_long fields.
 */
#[FieldConverter(id: 'text_long')]
class TextLongItem extends FieldConverterBase {

  /**
   * {@inheritdoc}
   */
  public function normalize(FieldItemListInterface $field_items): mixed {
    $data = [];
    foreach ($field_items as $item) {
      $data[] = [
        'value' => $item->get('value')->getValue(),
        'format' => $item->get('format') ? $item->get('format')->getValue() : NULL,
      ];
    }

    return $data;
  }

  /**
   * {@inheritdoc}
   */
  public function denormalize(array $data): mixed {
    $field_values = [];
    foreach ($data as $value) {
      $field_values[] = [
        'value' => $value['value'] ?? NULL,
        'format' => $value['format'] ?? NULL,
      ];
    }
    return $field_values;
  }

}
