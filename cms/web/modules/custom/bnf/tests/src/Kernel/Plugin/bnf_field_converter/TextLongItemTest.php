<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Kernel\Plugin\bnf_field_converter;

use Drupal\bnf\Plugin\bnf_field_converter\TextLongItem;
use Drupal\entity_test\Entity\EntityTest;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\Tests\field\Kernel\FieldKernelTestBase;

/**
 * Tests the TextLongItem field converter.
 *
 * @coversDefaultClass \Drupal\bnf\Plugin\bnf_field_converter\TextLongItem
 * @group bnf
 */
class TextLongItemTest extends FieldKernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['text', 'filter', 'bnf'];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    FieldStorageConfig::create([
      'entity_type' => 'entity_test',
      'field_name' => 'field_test_text_long',
      'type' => 'text_long',
    ])->save();

    FieldConfig::create([
      'entity_type' => 'entity_test',
      'field_name' => 'field_test_text_long',
      'bundle' => 'entity_test',
    ])->save();
  }

  /**
   * Tests normalizing text_long fields.
   *
   * @covers ::normalize
   */
  public function testNormalize(): void {
    $entity = EntityTest::create([
      'field_test_text_long' => [
        ['value' => '<p>Test value 1</p>', 'format' => 'basic_html'],
        ['value' => 'Test value 2', 'format' => 'plain_text'],
      ],
    ]);
    $entity->save();

    $converter = $this->container->get('plugin.manager.bnf_field_converter')->createInstance('text_long');
    $normalized = $converter->normalize($entity->get('field_test_text_long'));
    $this->assertSame([
      ['value' => '<p>Test value 1</p>', 'format' => 'basic_html'],
      ['value' => 'Test value 2', 'format' => 'plain_text'],
    ], $normalized);
  }

  /**
   * Tests denormalizing text_long fields.
   *
   * @covers ::denormalize
   */
  public function testDenormalize(): void {
    $incoming_data = [
      ['value' => '<p>Test value 1</p>', 'format' => 'basic_html'],
      ['value' => 'Test value 2', 'format' => 'plain_text'],
    ];

    $converter = $this->container->get('plugin.manager.bnf_field_converter')->createInstance('text_long');
    $denormalized = $converter->denormalize($incoming_data);

    $entity = EntityTest::create();
    $entity->set('field_test_text_long', $denormalized);
    $entity->save();

    $this->assertSame('<p>Test value 1</p>', $entity->get('field_test_text_long')->get(0)->value);
    $this->assertSame('basic_html', $entity->get('field_test_text_long')->get(0)->format);
    $this->assertSame('Test value 2', $entity->get('field_test_text_long')->get(1)->value);
    $this->assertSame('plain_text', $entity->get('field_test_text_long')->get(1)->format);
  }

}
