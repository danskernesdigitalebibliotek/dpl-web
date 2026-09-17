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
 *
 * As entity converter classes should implement `fields()` and rely on
 * `EntityConverterBase`s implementation of normalize/denormalize, there's no
 * reason to test field handling for each entity type. So most entity converters
 * tests can just extend this class, implement `setUp()` to call
 * `$this->setupConverter` and leave it at that.
 *
 * This class will take care of testing that all fields configured in the
 * configuration in `config/sync` is accounted for, either by the converter
 * returning it it `fields()`, or the test explicitly marking it as ingored in
 * `ignoredFields()`.
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

  protected string $entityType;
  protected string $bundle;

  /**
   * Fields in configuration that's not synchronized.
   *
   * @return string[]
   *   Array of field names.
   */
  public function ignoredFields(): array {
    return [];
  }

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
    $this->entityType = $entityType;
    $this->bundle = $bundle;

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
   * Test that all configured fields has been handled.
   *
   * Inspects the site configuration to find configured fields. Doesn't check if
   * the field converter type is appropriate, just that there is one for the
   * field.
   */
  public function testAllFieldsHandled(): void {
    $fileBase = sprintf('field.field.%s.%s', $this->entityType, $this->bundle);
    $configFiles = glob(sprintf('../config/sync/%s.*', $fileBase));

    $fields = [];
    foreach ($configFiles as $file) {
      $filename = basename($file, '.yml');
      $fields[] = substr($filename, strlen($fileBase) + 1);

    }

    $handledFields = array_merge(array_keys($this->converter->fields()), $this->ignoredFields());
    $unhandledFields = array_diff($fields, $handledFields);

    $this->assertEmpty(
      $unhandledFields,
      'All configured fields should be handled, these are not: ' .
      implode(', ', $unhandledFields) . PHP_EOL .
      'Either ensure all fields are mapped, or add them to ingoredFields() in the test'
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
