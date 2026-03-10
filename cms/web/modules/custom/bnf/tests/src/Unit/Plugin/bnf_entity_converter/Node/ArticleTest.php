<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Plugin\bnf_entity_converter\Node;

use Drupal\bnf\Plugin\bnf_entity_converter\Node\Article;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\node\NodeInterface;
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
   * Tests normalizing an Article entity.
   *
   * @covers ::normalize
   */
  public function testNormalize(): void {
    $node = $this->prophesize(NodeInterface::class);
    $this->mockFieldAndConverter($node, 'title', 'string');
    $this->mockFieldAndConverter($node, 'uuid', 'string');

    $data = $this->converter->normalize($node->reveal());

    $this->assertEquals([
      'title' => 'field title mock',
      'uuid' => 'field uuid mock',
    ], $data);
  }

  /**
   * Tests denormalizing data into an Article entity.
   *
   * @covers ::denormalize
   */
  public function testDenormalize(): void {
    $incoming_data = [
      'uuid' => ['1234-5678-9012-3456'],
      'title' => ['Test Article'],
    ];

    $nodeStorage = $this->prophesize(EntityStorageInterface::class);
    $this->entityTypeManager->getStorage('node')->willReturn($nodeStorage->reveal());

    $nodeStorage->loadByProperties(['uuid' => '1234-5678-9012-3456'])->willReturn([]);
    $nodeMock = $this->prophesize(NodeInterface::class);
    $nodeStorage->create([
      'type' => 'article',
      'uuid' => '1234-5678-9012-3456',
    ])->willReturn($nodeMock);

    $this->fieldConverterManager->denormalize('string', ['Test Article'])
      ->willReturn([['value' => 'Test Article']]);
    $this->fieldConverterManager->denormalize('string', ['1234-5678-9012-3456'])
      ->willReturn([['value' => '1234-5678-9012-3456']]);

    $this->converter->denormalize($incoming_data);

    $nodeMock->set('title', [['value' => 'Test Article']])->shouldHaveBeenCalled();
    $nodeMock->set('uuid', [['value' => '1234-5678-9012-3456']])->shouldHaveBeenCalled();
  }

}
