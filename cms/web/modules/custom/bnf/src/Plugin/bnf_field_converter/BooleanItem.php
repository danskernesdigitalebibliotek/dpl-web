<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_field_converter;

use Drupal\bnf\Attribute\FieldConverter;
use Drupal\Core\Field\FieldItemListInterface;

/**
 * Field converter for boolean fields.
 */
#[FieldConverter(id: 'boolean')]
class BooleanItem extends FieldConverterBase {

  /**
   * {@inheritdoc}
   */
  public function normalize(FieldItemListInterface $field_items): mixed {
    $data = [];
    foreach ($field_items as $item) {
      $data[] = (bool) $item->get('value')->getValue();
    }

    return $data;
  }

  /**
   * {@inheritdoc}
   */
  public function denormalize(array $data): mixed {
    $field_values = [];
    foreach ($data as $value) {
      $field_values[] = ['value' => (bool) $value];
    }
    return $field_values;
  }

}
