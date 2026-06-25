<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Kernel\Plugin\bnf_field_converter;

use Drupal\entity_test\Entity\EntityTest;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\KernelTests\KernelTestBase;

/**
 * Tests the string field converter plugin.
 *
 * @coversDefaultClass \Drupal\bnf\Plugin\bnf_field_converter\StringItem
 * @group bnf
 */
class StringItemTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'entity_test',
    'field',
    'user',
    'system',
    'bnf',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->installEntitySchema('user');
    $this->installEntitySchema('entity_test');

    // Create a string field attached to entity_test.
    FieldStorageConfig::create([
      'entity_type' => 'entity_test',
      'field_name' => 'field_test_string',
      'type' => 'string',
      'cardinality' => -1,
    ])->save();

    FieldConfig::create([
      'entity_type' => 'entity_test',
      'bundle' => 'entity_test',
      'field_name' => 'field_test_string',
      'label' => 'Test String Field',
    ])->save();
  }

  /**
   * Tests normalizing field items to a network array.
   *
   * @covers ::normalize
   */
  public function testNormalize(): void {
    /** @var \Drupal\bnf\FieldConverterManager $manager */
    $manager = $this->container->get('plugin.manager.bnf_field_converter');
    /** @var \Drupal\bnf\FieldConverterInterface $converter */
    $converter = $manager->createInstance('string');

    // Setup an entity with field data.
    $entity = EntityTest::create([
      'field_test_string' => ['Value 1', 'Value 2'],
    ]);

    // Test normalization.
    $normalized = $converter->normalize($entity->get('field_test_string'));
    $this->assertSame(['Value 1', 'Value 2'], $normalized);

    // Test empty value.
    $entity_empty = EntityTest::create([]);
    $normalized_empty = $converter->normalize($entity_empty->get('field_test_string'));
    $this->assertSame([], $normalized_empty);
  }

  /**
   * Tests denormalizing network data back into Drupal field data.
   *
   * @covers ::denormalize
   */
  public function testDenormalize(): void {
    /** @var \Drupal\bnf\FieldConverterManager $manager */
    $manager = $this->container->get('plugin.manager.bnf_field_converter');
    /** @var \Drupal\bnf\FieldConverterInterface $converter */
    $converter = $manager->createInstance('string');

    // Normalized data.
    $incoming_data = [
      'Value A',
      'Value B',
    ];

    $denormalized = $converter->denormalize($incoming_data);

    // Apply the data to an entity to ensure that it's properly set.
    $entity = EntityTest::create([]);
    $entity->set('field_test_string', $denormalized);

    // @phpstan-ignore property.nonObject (we know get returns an object)
    $this->assertSame('Value A', $entity->get('field_test_string')->get(0)->value);
    // @phpstan-ignore property.nonObject (ditto)
    $this->assertSame('Value B', $entity->get('field_test_string')->get(1)->value);
  }

}
