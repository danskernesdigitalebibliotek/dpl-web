<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Kernel\Plugin\bnf_field_converter;

use Drupal\datetime\Plugin\Field\FieldType\DateTimeItem as DrupalDateTimeItem;
use Drupal\entity_test\Entity\EntityTest;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\KernelTests\KernelTestBase;

/**
 * Tests the datetime field converter plugin.
 *
 * @coversDefaultClass \Drupal\bnf\Plugin\bnf_field_converter\DateTimeItem
 * @group bnf
 */
class DateTimeItemTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'entity_test',
    'field',
    'user',
    'system',
    'datetime',
    'bnf',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->installEntitySchema('user');
    $this->installEntitySchema('entity_test');

    // Create a datetime field attached to entity_test.
    FieldStorageConfig::create([
      'entity_type' => 'entity_test',
      'field_name' => 'field_test_datetime',
      'type' => 'datetime',
      'cardinality' => -1,
      'settings' => ['datetime_type' => DrupalDateTimeItem::DATETIME_TYPE_DATETIME],
    ])->save();

    FieldConfig::create([
      'entity_type' => 'entity_test',
      'bundle' => 'entity_test',
      'field_name' => 'field_test_datetime',
      'label' => 'Test Datetime Field',
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
    $converter = $manager->createInstance('datetime');

    // Setup an entity with field data.
    $entity = EntityTest::create([
      'field_test_datetime' => ['2024-03-10T12:00:00', '2024-03-11T12:00:00'],
    ]);

    // Test normalization.
    $normalized = $converter->normalize($entity->get('field_test_datetime'));
    $this->assertSame(['2024-03-10T12:00:00', '2024-03-11T12:00:00'], $normalized);

    // Test empty value.
    $entity_empty = EntityTest::create([]);
    $normalized_empty = $converter->normalize($entity_empty->get('field_test_datetime'));
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
    $converter = $manager->createInstance('datetime');

    // Normalized data.
    $incoming_data = [
      '2024-03-10T12:00:00',
      '2024-03-11T12:00:00',
    ];

    $denormalized = $converter->denormalize($incoming_data);

    // Apply the data to an entity to ensure that it's properly set.
    $entity = EntityTest::create([]);
    $entity->set('field_test_datetime', $denormalized);

    // @phpstan-ignore property.nonObject (we know get returns an object)
    $this->assertEquals('2024-03-10T12:00:00', $entity->get('field_test_datetime')->get(0)->value);
    // @phpstan-ignore property.nonObject (ditto)
    $this->assertEquals('2024-03-11T12:00:00', $entity->get('field_test_datetime')->get(1)->value);
  }

}
