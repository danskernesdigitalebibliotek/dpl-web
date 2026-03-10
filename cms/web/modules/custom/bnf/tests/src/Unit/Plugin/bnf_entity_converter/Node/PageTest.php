<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Plugin\bnf_entity_converter\Node;

use Drupal\bnf\Plugin\bnf_entity_converter\Node\Page;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\node\NodeInterface;
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
    return ['field_branch'];
  }

  /**
   * Tests normalizing an Page entity.
   *
   * @covers ::normalize
   */
  public function testNormalize(): void {
    $node = $this->prophesize(NodeInterface::class);
    $this->mockFieldAndConverter($node, 'title', 'string');
    $this->mockFieldAndConverter($node, 'uuid', 'string');
    $this->mockFieldAndConverter($node, 'field_paragraphs', 'entity_reference');

    $data = $this->converter->normalize($node->reveal());

    $this->assertEquals([
      'title' => 'field title mock',
      'uuid' => 'field uuid mock',
      'field_paragraphs' => 'field field_paragraphs mock',
    ], $data);
  }

  /**
   * Tests denormalizing data into an Page entity.
   *
   * @covers ::denormalize
   */
  public function testDenormalize(): void {
    $incoming_data = [
      'uuid' => ['1234-5678-9012-3456'],
      'title' => ['Test Page'],
      'field_paragraphs' => ['mock paragraph']
    ];

    $nodeStorage = $this->prophesize(EntityStorageInterface::class);
    $this->entityTypeManager->getStorage('node')->willReturn($nodeStorage->reveal());

    $nodeStorage->loadByProperties(['uuid' => '1234-5678-9012-3456'])->willReturn([]);
    $nodeMock = $this->prophesize(NodeInterface::class);
    $nodeStorage->create([
      'type' => 'article',
      'uuid' => '1234-5678-9012-3456',
    ])->willReturn($nodeMock);

    // This needs to match the format that the format that the real field
    // converter returns as EntityConverterBase extracts the UUID from it. The
    // rest don't as we're not testing the field converters here.
    $this->fieldConverterManager->denormalize('string', ['1234-5678-9012-3456'])
      ->willReturn([['value' => '1234-5678-9012-3456']]);
    $this->fieldConverterManager->denormalize('string', ['Test Page'])
      ->willReturn('Test Page');
    $this->fieldConverterManager->denormalize('entity_reference', ['mock paragraph'])
      ->willReturn('mock paragraph');

    $this->converter->denormalize($incoming_data);

    $nodeMock->set('title', 'Test Page')->shouldHaveBeenCalled();
    $nodeMock->set('uuid', [['value' => '1234-5678-9012-3456']])->shouldHaveBeenCalled();
    $nodeMock->set('field_paragraphs', 'mock paragraph')->shouldHaveBeenCalled();
  }

}
