<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Plugin\bnf_entity_converter\Node;

use Drupal\bnf\Plugin\bnf_entity_converter\Node\Page;
use Drupal\Tests\bnf\Unit\Plugin\bnf_entity_converter\EntityConverterTestBase;

/**
 * Tests the Page entity converter plugin.
 *
 * @coversDefaultClass \Drupal\bnf\Plugin\bnf_entity_converter\Node\Page
 * @group bnf
 */
class PageTest extends EntityConverterTestBase {

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->setupConverter(Page::class, 'node', 'page');
  }

  /**
   * {@inheritdoc}
   */
  public function ignoredFields(): array {
    return ['field_branch', 'field_breadcrumb_parent', 'field_tags'];
  }

}
