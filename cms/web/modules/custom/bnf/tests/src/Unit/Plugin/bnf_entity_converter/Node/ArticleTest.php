<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Plugin\bnf_entity_converter\Node;

use Drupal\bnf\Plugin\bnf_entity_converter\Node\Article;
use Drupal\Tests\bnf\Unit\Plugin\bnf_entity_converter\EntityConverterTestBase;

/**
 * Tests the Article entity converter plugin.
 *
 * @coversDefaultClass \Drupal\bnf\Plugin\bnf_entity_converter\Node\Article
 * @group bnf
 */
class ArticleTest extends EntityConverterTestBase {

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->setupConverter(Article::class, 'node', 'article');
  }

  /**
   * {@inheritdoc}
   */
  public function ignoredFields(): array {
    return ['field_branch', 'field_categories', 'field_tags'];
  }

}

