<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_entity_converter\Node;

use Drupal\bnf\Attribute\EntityConverter;
use Drupal\bnf\Plugin\bnf_entity_converter\Node;

/**
 * Converter for Page nodes.
 */
#[EntityConverter(
  id: 'Drupal\bnf\Plugin\bnf_entity_converter\Node\Page',
  entity_type: 'node',
  bundle: 'page',
  )]
class Page extends Node {

  /**
   * {@inheritdoc}
   */
  public function fields(): array {
    return parent::fields() + [
      'field_paragraphs' => 'entity_reference',
      'field_subtitle' => 'string',
      'field_teaser_text' => 'string',
      'field_teaser_image' => 'entity_reference',
      'field_hero_title' => 'string',
      'field_display_titles' => 'boolean',
    ];
  }

}
