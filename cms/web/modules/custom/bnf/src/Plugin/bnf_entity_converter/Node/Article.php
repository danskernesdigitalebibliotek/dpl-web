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
    return parent::fields() + [];
  }

}
