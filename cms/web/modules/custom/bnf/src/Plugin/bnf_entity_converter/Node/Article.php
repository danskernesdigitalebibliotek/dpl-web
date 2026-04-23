<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_entity_converter\Node;

use Drupal\bnf\Attribute\EntityConverter;
use Drupal\bnf\Plugin\bnf_entity_converter\Node;

/**
 * Converter for Article nodes.
 */
#[EntityConverter(
  id: 'Drupal\bnf\Plugin\bnf_entity_converter\Node\Article',
  entity_type: 'node',
  bundle: 'article',
)]
class Article extends Node {

  /**
   * {@inheritdoc}
   */
  public function fields(): array {
    return parent::fields() + [
      'field_paragraphs' => 'entity_reference',
      'field_show_override_author' => 'boolean',
      'field_override_author' => 'string',
      'field_subtitle' => 'string',
      'field_teaser_text' => 'string',
      'field_teaser_image' => 'entity_reference',
    ];
  }

}
