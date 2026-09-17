<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Kernel\Plugin\bnf_field_converter;

use Drupal\entity_test\Entity\EntityTest;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\KernelTests\KernelTestBase;

/**
 * Tests the boolean field converter plugin.
 *
 * @coversDefaultClass \Drupal\bnf\Plugin\bnf_field_converter\BooleanItem
 * @group bnf
 */
class BooleanItemTest extends KernelTestBase {

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

    // Create a boolean field attached to entity_test.
    FieldStorageConfig::create([
      'entity_type' => 'entity_test',
      'field_name' => 'field_test_boolean',
      'type' => 'boolean',
      'cardinality' => -1,
    ])->save();

    FieldConfig::create([
      'entity_type' => 'entity_test',
      'bundle' => 'entity_test',
      'field_name' => 'field_test_boolean',
      'label' => 'Test Boolean Field',
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
    $converter = $manager->createInstance('boolean');

    // Setup an entity with field data.
    $entity = EntityTest::create([
      'field_test_boolean' => [TRUE, FALSE],
    ]);

    // Test normalization.
    $normalized = $converter->normalize($entity->get('field_test_boolean'));
    $this->assertSame([TRUE, FALSE], $normalized);

    // Test empty value.
    $entity_empty = EntityTest::create([]);
    $normalized_empty = $converter->normalize($entity_empty->get('field_test_boolean'));
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
    $converter = $manager->createInstance('boolean');

    // Normalized data.
    $incoming_data = [
      TRUE,
      FALSE,
    ];

    $denormalized = $converter->denormalize($incoming_data);

    // Apply the data to an entity to ensure that it's properly set.
    $entity = EntityTest::create([]);
    $entity->set('field_test_boolean', $denormalized);

    // @phpstan-ignore property.nonObject (we know get returns an object)
    $this->assertEquals(TRUE, (bool) $entity->get('field_test_boolean')->get(0)->value);
    // @phpstan-ignore property.nonObject (ditto)
    $this->assertEquals(FALSE, (bool) $entity->get('field_test_boolean')->get(1)->value);
  }

}
