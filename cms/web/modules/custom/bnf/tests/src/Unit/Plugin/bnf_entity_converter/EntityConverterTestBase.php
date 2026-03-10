<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Plugin\bnf_entity_converter;

use Drupal\bnf\FieldConverterManager;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Tests\UnitTestCase;
use Prophecy\PhpUnit\ProphecyTrait;
use Prophecy\Prophecy\ObjectProphecy;
use Psr\Log\LoggerInterface;

/**
 * Base class for entity converter plugin tests.
 */
abstract class EntityConverterTestBase extends UnitTestCase {

  use ProphecyTrait;

  /**
   * The mocked entity type manager.
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
   * The mocked logger.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Psr\Log\LoggerInterface>
   */
  protected $logger;

  /**
   * The Article converter under test.
   *
   * @var \Drupal\bnf\EntityConverterInterface
   */
  protected $converter;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->entityTypeManager = $this->prophesize(EntityTypeManagerInterface::class);
    $this->logger = $this->prophesize(LoggerInterface::class);

    $this->fieldConverterManager = $this->prophesize(FieldConverterManager::class);
  }

  /**
   * Setup the converter for testing.
   */
  protected function setupConverter(string $class, string $entityType, string $bundle): void {
    $configuration = [];
    $plugin_id = 'test_converter';
    $plugin_definition = [
      'id' => $class,
      'entity_type' => $entityType,
      'bundle' => $bundle,
    ];

    $this->converter = new $class(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $this->fieldConverterManager->reveal(),
      $this->entityTypeManager->reveal(),
      $this->logger->reveal()
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

}
