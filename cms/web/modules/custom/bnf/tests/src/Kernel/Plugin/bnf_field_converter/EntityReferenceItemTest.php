<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Kernel\Plugin\bnf_field_converter;

use Drupal\entity_test\Entity\EntityTest;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\KernelTests\KernelTestBase;

/**
 * Tests the entity reference field converter plugin.
 *
 * @coversDefaultClass \Drupal\bnf\Plugin\bnf_field_converter\EntityReferenceItem
 * @group bnf
 */
class EntityReferenceItemTest extends KernelTestBase {

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

    // Create an entity reference field attached to entity_test.
    FieldStorageConfig::create([
      'entity_type' => 'entity_test',
      'field_name' => 'field_test_er',
      'type' => 'entity_reference',
      'cardinality' => -1,
      'settings' => [
        'target_type' => 'entity_test',
      ],
    ])->save();

    FieldConfig::create([
      'entity_type' => 'entity_test',
      'bundle' => 'entity_test',
      'field_name' => 'field_test_er',
      'label' => 'Test ER Field',
      'settings' => [
        'handler' => 'default',
        'handler_settings' => [],
      ],
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
    $converter = $manager->createInstance('entity_reference');

    // Setup entities to be referenced.
    $referenced_entity_1 = EntityTest::create(['name' => 'Referenced 1']);
    $referenced_entity_1->save();

    $referenced_entity_2 = EntityTest::create(['name' => 'Referenced 2']);
    $referenced_entity_2->save();

    // Setup an entity with field data referencing the above entities.
    $entity = EntityTest::create([
      'field_test_er' => [
        ['target_id' => $referenced_entity_1->id()],
        ['target_id' => $referenced_entity_2->id()],
      ],
    ]);

    // Test normalization.
    $normalized = $converter->normalize($entity->get('field_test_er'));

    $expected = [
      [
        'type' => 'entity_test',
        'uuid' => $referenced_entity_1->uuid(),
      ],
      [
        'type' => 'entity_test',
        'uuid' => $referenced_entity_2->uuid(),
      ],
    ];
    $this->assertSame($expected, $normalized);

    // Test empty value.
    $entity_empty = EntityTest::create([]);
    $normalized_empty = $converter->normalize($entity_empty->get('field_test_er'));
    $this->assertSame([], $normalized_empty);
  }

}
