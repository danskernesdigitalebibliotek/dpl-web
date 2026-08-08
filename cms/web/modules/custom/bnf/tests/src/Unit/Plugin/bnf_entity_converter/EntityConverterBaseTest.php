<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Plugin\bnf_entity_converter;

use Drupal\bnf\FieldConverterManager;
use Drupal\bnf\Plugin\bnf_entity_converter\EntityConverterBase;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\node\NodeInterface;
use Drupal\Tests\UnitTestCase;
use Prophecy\PhpUnit\ProphecyTrait;
use Prophecy\Prophecy\ObjectProphecy;

/**
 * Tests the EntityConverterBase class.
 *
 * @coversDefaultClass \Drupal\bnf\Plugin\bnf_entity_converter\EntityConverterBase
 * @group bnf
 */
class EntityConverterBaseTest extends UnitTestCase {

  use ProphecyTrait;

  /**
   * The mocked field converter manager.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\bnf\FieldConverterManager>
   */
  protected $fieldConverterManager;

  /**
   * The mocked entity type manager.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\EntityTypeManagerInterface>
   */
  protected $entityTypeManager;

  /**
   * The converter under test.
   *
   * @var \Drupal\bnf\Plugin\bnf_entity_converter\EntityConverterBase
   */
  protected $converter;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->entityTypeManager = $this->prophesize(EntityTypeManagerInterface::class);
    $this->fieldConverterManager = $this->prophesize(FieldConverterManager::class);

    $configuration = [];
    $plugin_id = 'test_converter';
    $plugin_definition = [
      'id' => 'test_converter',
      'entity_type' => 'node',
      'bundle' => 'article',
    ];

    $this->converter = new TestEntityConverter(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $this->fieldConverterManager->reveal(),
      $this->entityTypeManager->reveal()
    );
  }

  /**
   * Set up a node field mock and corresponding converter mock.
   */
  protected function mockFieldAndConverter(ObjectProphecy $node, string $field, string $type): void {
    $fieldMock = $this->prophesize(FieldItemListInterface::class);
    $node->get($field)->willReturn($fieldMock);
    $this->fieldConverterManager->normalize($type, $fieldMock)
      ->willReturn('field ' . $field . ' mock');
  }

  /**
   * Tests normalizing an entity.
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
   * Tests denormalizing data into an entity.
   *
   * @covers ::denormalize
   */
  public function testDenormalize(): void {
    $incoming_data = [
      'uuid' => ['1234-5678-9012-3456'],
      'title' => ['Test Article'],
      'field_paragraphs' => ['mock paragraph']
    ];

    $nodeStorage = $this->prophesize(EntityStorageInterface::class);
    $this->entityTypeManager->getStorage('node')->willReturn($nodeStorage->reveal());
    $entityDefinition = $this->prophesize(EntityTypeInterface::class);
    $entityDefinition->getKey('bundle')->willReturn('type');
    $this->entityTypeManager->getDefinition('node')->willReturn($entityDefinition);

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
    $this->fieldConverterManager->denormalize('string', ['Test Article'])
      ->willReturn('Test Article');
    $this->fieldConverterManager->denormalize('entity_reference', ['mock paragraph'])
      ->willReturn('mock paragraph');

    $this->converter->denormalize($incoming_data);

    $nodeMock->set('title', 'Test Article')->shouldHaveBeenCalled();
    $nodeMock->set('uuid', [['value' => '1234-5678-9012-3456']])->shouldHaveBeenCalled();
    $nodeMock->set('field_paragraphs', 'mock paragraph')->shouldHaveBeenCalled();
  }

}

/**
 * A test subclass of EntityConverterBase.
 */
class TestEntityConverter extends EntityConverterBase {

  /**
   * {@inheritdoc}
   */
  public function fields(): array {
    return [
      'title' => 'string',
      'field_paragraphs' => 'entity_reference',
    ];
  }

}
