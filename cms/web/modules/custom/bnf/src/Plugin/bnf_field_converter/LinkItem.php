<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_field_converter;

use Drupal\bnf\Attribute\FieldConverter;
use Drupal\Core\Field\FieldItemListInterface;

/**
 * Field converter for link fields.
 */
#[FieldConverter(id: 'link')]
class LinkItem extends FieldConverterBase {

  /**
   * {@inheritdoc}
   */
  public function normalize(FieldItemListInterface $field_items): mixed {
    $data = [];
    foreach ($field_items as $item) {
      $data[] = [
        'uri' => $item->get('uri')->getValue(),
        'title' => $item->get('title')->getValue(),
        'options' => $item->get('options')->getValue(),
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
        'uri' => $value['uri'] ?? NULL,
        'title' => $value['title'] ?? NULL,
        'options' => $value['options'] ?? [],
      ];
    }
    return $field_values;
  }

}
