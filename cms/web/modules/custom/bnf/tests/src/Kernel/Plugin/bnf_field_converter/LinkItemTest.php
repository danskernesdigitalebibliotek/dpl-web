<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Kernel\Plugin\bnf_field_converter;

use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\entity_test\Entity\EntityTest;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\KernelTests\KernelTestBase;
use Drupal\link\LinkItemInterface;

/**
 * Tests the link field converter plugin.
 *
 * @coversDefaultClass \Drupal\bnf\Plugin\bnf_field_converter\LinkItem
 * @group bnf
 */
class LinkItemTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'entity_test',
    'field',
    'user',
    'system',
    'link',
    'bnf',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->installEntitySchema('user');
    $this->installEntitySchema('entity_test');

    // Create a link field attached to entity_test.
    FieldStorageConfig::create([
      'entity_type' => 'entity_test',
      'field_name' => 'field_test_link',
      'type' => 'link',
      'cardinality' => FieldStorageDefinitionInterface::CARDINALITY_UNLIMITED,
    ])->save();

    FieldConfig::create([
      'entity_type' => 'entity_test',
      'bundle' => 'entity_test',
      'field_name' => 'field_test_link',
      'label' => 'Test Link Field',
      'settings' => [
        // DRUPAL_OPTIONAL is defined in system.module.
        'title' => \DRUPAL_OPTIONAL,
        'link_type' => LinkItemInterface::LINK_GENERIC,
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
    $converter = $manager->createInstance('link');

    // Create an entity to reference.
    $referenced_entity = EntityTest::create([]);
    $referenced_entity->save();

    // Setup an entity with field data.
    $entity = EntityTest::create([
      'field_test_link' => [
        [
          'uri' => 'https://example.com',
          'title' => 'Example Website',
          'options' => ['attributes' => ['target' => '_blank']],
        ],
        [
          'uri' => 'internal:/node/1',
          'title' => 'Internal Node',
        ],
        [
          'uri' => 'entity:entity_test/' . $referenced_entity->id(),
          'title' => 'Referenced Entity',
        ],
      ],
    ]);

    // Test normalization.
    $normalized = $converter->normalize($entity->get('field_test_link'));
    $this->assertEquals([
      [
        'uri' => 'https://example.com',
        'title' => 'Example Website',
        'options' => ['attributes' => ['target' => '_blank']],
      ],
      [
        'uri' => 'internal:/node/1',
        'title' => 'Internal Node',
        'options' => [],
      ],
      [
        'uuid' => $referenced_entity->uuid(),
        'entity_type' => 'entity_test',
        'title' => 'Referenced Entity',
        'options' => [],
      ],
    ], $normalized);

    // Test getDependees.
    $dependees = $converter->getDependees($entity->get('field_test_link'));
    $this->assertSame([
      'entity_test:' . $referenced_entity->uuid(),
    ], $dependees);

    // Test empty value.
    $entity_empty = EntityTest::create([]);
    $normalized_empty = $converter->normalize($entity_empty->get('field_test_link'));
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
    $converter = $manager->createInstance('link');

    // Create an entity to be referenced by the normalized data.
    $referenced_entity = EntityTest::create([]);
    $referenced_entity->save();

    // Normalized data.
    $incoming_data = [
      [
        'uri' => 'https://drupal.org',
        'title' => 'Drupal',
        'options' => ['attributes' => ['class' => ['external-link']]],
      ],
      [
        'uri' => 'internal:/contact',
        'title' => 'Contact Us',
      ],
      [
        'uuid' => $referenced_entity->uuid(),
        'entity_type' => 'entity_test',
        'title' => 'Referenced Entity',
      ],
    ];

    $denormalized = $converter->denormalize($incoming_data);

    // Apply the data to an entity to ensure that it's properly set.
    $entity = EntityTest::create([]);
    $entity->set('field_test_link', $denormalized);

    // @phpstan-ignore property.nonObject (we know get returns an object)
    $this->assertEquals('https://drupal.org', $entity->get('field_test_link')->get(0)->uri);
    // @phpstan-ignore property.nonObject (ditto)
    $this->assertEquals('Drupal', $entity->get('field_test_link')->get(0)->title);
    // @phpstan-ignore property.nonObject (ditto)
    $this->assertEquals(['attributes' => ['class' => ['external-link']]], $entity->get('field_test_link')->get(0)->options);

    // @phpstan-ignore property.nonObject (ditto)
    $this->assertEquals('internal:/contact', $entity->get('field_test_link')->get(1)->uri);
    // @phpstan-ignore property.nonObject (ditto)
    $this->assertEquals('Contact Us', $entity->get('field_test_link')->get(1)->title);
    // @phpstan-ignore property.nonObject (ditto)
    $this->assertEquals([], $entity->get('field_test_link')->get(1)->options);

    // @phpstan-ignore property.nonObject (ditto)
    $this->assertEquals('entity:entity_test/' . $referenced_entity->id(), $entity->get('field_test_link')->get(2)->uri);
    // @phpstan-ignore property.nonObject (ditto)
    $this->assertEquals('Referenced Entity', $entity->get('field_test_link')->get(2)->title);
    // @phpstan-ignore property.nonObject (ditto)
    $this->assertEquals([], $entity->get('field_test_link')->get(2)->options);
  }

}
