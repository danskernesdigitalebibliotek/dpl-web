<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_entity_converter\Paragraph;

use Drupal\bnf\Attribute\EntityConverter;
use Drupal\bnf\Plugin\bnf_entity_converter\Paragraph;

/**
 * Converter for Text Body paragraphs.
 */
#[EntityConverter(
  id: 'Drupal\bnf\Plugin\bnf_entity_converter\Paragraph\TextBody',
  entity_type: 'paragraph',
  bundle: 'text_body',
)]
class TextBody extends Paragraph {

  /**
   * {@inheritdoc}
   */
  public function fields(): array {
    return [
      'field_body' => 'text_long',
    ];
  }

}
