<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Services;

use Drupal\bnf\EntityConverterInterface;
use Drupal\bnf\EntityConverterManager;
use Drupal\bnf\Services\ContentSerializer;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Tests\UnitTestCase;
use Prophecy\PhpUnit\ProphecyTrait;
use Prophecy\Prophecy\ObjectProphecy;

/**
 * Tests the ContentSerializer service.
 *
 * @coversDefaultClass \Drupal\bnf\Services\ContentSerializer
 * @group bnf
 */
class ContentSerializerTest extends UnitTestCase {

  use ProphecyTrait;

  /**
   * Helper to create a mock entity.
   *
   * @param string $entityType
   *   The entity type ID.
   * @param string $bundle
   *   The bundle name.
   * @param string $uuid
   *   The entity UUID.
   *
   * @return \Drupal\Core\Entity\FieldableEntityInterface
   *   The mock entity.
   */
  private function createMockEntity(string $entityType, string $bundle, string $uuid): FieldableEntityInterface {
    /** @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\FieldableEntityInterface> $entity */
    $entity = $this->prophesize(FieldableEntityInterface::class);
    $entity->getEntityTypeId()->willReturn($entityType);
    $entity->bundle()->willReturn($bundle);
    $entity->uuid()->willReturn($uuid);
    return $entity->reveal();
  }

  /**
   * Tests generating the content map.
   *
   * @covers ::getDependees
   * @covers ::buildContentMap
   */
  public function testBuildContentMap(): void {
    $entityA = $this->createMockEntity('node', 'article', 'uuid-A');
    $entityB = $this->createMockEntity('node', 'article', 'uuid-B');
    $entityC = $this->createMockEntity('node', 'article', 'uuid-C');

    $entityConverterManager = $this->prophesize(EntityConverterManager::class);
    $entityConverterManager->getDefinitions()->willReturn([
      'node_converter' => [
        'id' => 'node_converter',
        'entity_type' => 'node',
        'bundle' => 'article',
      ],
    ]);

    $nodeConverter = $this->prophesize(EntityConverterInterface::class);
    $nodeConverter->getDependees($entityA)->willReturn(['node:uuid-B']);
    $nodeConverter->getDependees($entityB)->willReturn(['node:uuid-C']);
    $nodeConverter->getDependees($entityC)->willReturn([]);

    $entityConverterManager->createInstance('node_converter')->willReturn($nodeConverter->reveal());

    $nodeStorage = $this->prophesize(EntityStorageInterface::class);
    $nodeStorage->loadByProperties(['uuid' => 'uuid-B'])->willReturn([$entityB]);
    $nodeStorage->loadByProperties(['uuid' => 'uuid-C'])->willReturn([$entityC]);

    $entityTypeManager = $this->prophesize(EntityTypeManagerInterface::class);
    $entityTypeManager->getStorage('node')->willReturn($nodeStorage->reveal());

    $serializer = new ContentSerializer($entityConverterManager->reveal(), $entityTypeManager->reveal());
    $contentMap = $serializer->getDependees($entityA);

    $expected = [
      'node:uuid-A' => ['node:uuid-B'],
      'node:uuid-B' => ['node:uuid-C'],
      'node:uuid-C' => [],
    ];

    $this->assertEquals($expected, $contentMap);
  }

  public function testBuildContentMap2(): void {
    $entityA = $this->createMockEntity('node', 'article', 'uuid-A');
    $entityB = $this->createMockEntity('node', 'article', 'uuid-B');
    $entityC = $this->createMockEntity('node', 'article', 'uuid-C');
    $entityD = $this->createMockEntity('node', 'article', 'uuid-D');

    $entityConverterManager = $this->prophesize(EntityConverterManager::class);
    $entityConverterManager->getDefinitions()->willReturn([
      'node_converter' => [
        'id' => 'node_converter',
        'entity_type' => 'node',
        'bundle' => 'article',
      ],
    ]);

    $nodeConverter = $this->prophesize(EntityConverterInterface::class);
    $nodeConverter->getDependees($entityA)->willReturn(['node:uuid-B', 'node:uuid-D']);
    $nodeConverter->getDependees($entityB)->willReturn(['node:uuid-C', 'node:uuid-D']);
    $nodeConverter->getDependees($entityC)->willReturn([]);
    $nodeConverter->getDependees($entityD)->willReturn([]);

    $entityConverterManager->createInstance('node_converter')->willReturn($nodeConverter->reveal());

    $nodeStorage = $this->prophesize(EntityStorageInterface::class);
    $nodeStorage->loadByProperties(['uuid' => 'uuid-B'])->willReturn([$entityB]);
    $nodeStorage->loadByProperties(['uuid' => 'uuid-C'])->willReturn([$entityC]);
    $nodeStorage->loadByProperties(['uuid' => 'uuid-D'])->willReturn([$entityD]);

    $entityTypeManager = $this->prophesize(EntityTypeManagerInterface::class);
    $entityTypeManager->getStorage('node')->willReturn($nodeStorage->reveal());

    $serializer = new ContentSerializer($entityConverterManager->reveal(), $entityTypeManager->reveal());
    $contentMap = $serializer->getDependees($entityA);

    $expected = [
      'node:uuid-A' => ['node:uuid-B', 'node:uuid-D'],
      'node:uuid-B' => ['node:uuid-C', 'node:uuid-D'],
      'node:uuid-C' => [],
      'node:uuid-D' => [],
    ];

    $this->assertEquals($expected, $contentMap);
  }

  /**
   * Tests generating the content map with cyclic dependencies throws an exception.
   *
   * @covers ::getDependees
   * @covers ::buildContentMap
   */
  public function testCyclicContentMapThrows(): void {
    $entityA = $this->createMockEntity('node', 'article', 'uuid-A');
    $entityB = $this->createMockEntity('node', 'article', 'uuid-B');
    $entityC = $this->createMockEntity('node', 'article', 'uuid-C');

    $entityConverterManager = $this->prophesize(EntityConverterManager::class);
    $entityConverterManager->getDefinitions()->willReturn([
      'node_converter' => [
        'id' => 'node_converter',
        'entity_type' => 'node',
        'bundle' => 'article',
      ],
    ]);

    $nodeConverter = $this->prophesize(EntityConverterInterface::class);
    $nodeConverter->getDependees($entityA)->willReturn(['node:uuid-B']);
    $nodeConverter->getDependees($entityB)->willReturn(['node:uuid-C']);
    $nodeConverter->getDependees($entityC)->willReturn(['node:uuid-A']);

    $entityConverterManager->createInstance('node_converter')->willReturn($nodeConverter->reveal());

    $nodeStorage = $this->prophesize(EntityStorageInterface::class);
    $nodeStorage->loadByProperties(['uuid' => 'uuid-B'])->willReturn([$entityB]);
    $nodeStorage->loadByProperties(['uuid' => 'uuid-C'])->willReturn([$entityC]);
    $nodeStorage->loadByProperties(['uuid' => 'uuid-A'])->willReturn([$entityA]);

    $entityTypeManager = $this->prophesize(EntityTypeManagerInterface::class);
    $entityTypeManager->getStorage('node')->willReturn($nodeStorage->reveal());

    $serializer = new ContentSerializer($entityConverterManager->reveal(), $entityTypeManager->reveal());

    $this->expectException(\RuntimeException::class);
    $this->expectExceptionMessage('Cyclic reference detected: node:uuid-A -> node:uuid-B -> node:uuid-C -> node:uuid-A');

    $serializer->getDependees($entityA);
  }

}
