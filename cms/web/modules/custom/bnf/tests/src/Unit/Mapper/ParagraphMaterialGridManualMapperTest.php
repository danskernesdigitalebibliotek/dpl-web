<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\MaterialGridWorkIds\WorkId;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridManual;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphMaterialGridManualMapper;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Tests the material_grid_manual paragraph mapper.
 */
class ParagraphMaterialGridManualMapperTest extends EntityMapperTestBase {

  /**
   * {@inheritdoc}
   */
  protected function getEntityName(): string {
    return 'paragraph';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEntityClass(): string {
    return Paragraph::class;
  }

  /**
   * Test material grid manual paragraph mapping.
   */
  public function testParagraphMaterialGridManualMapping(): void {
    $this->storageProphecy->create([
      'type' => 'material_grid_manual',
      'field_material_grid_title' => 'Magical Favorites',
      'field_material_grid_description' => 'Hand-picked books from the wizarding world',
      'field_material_grid_work_ids' => [
        ['value' => 'chamber-of-secrets', 'material_type' => 'book'],
        ['value' => 'fantastic-beasts', 'material_type' => 'book'],
      ],
    ])->willReturn($this->entityProphecy)->shouldBeCalled();

    $mapper = new ParagraphMaterialGridManualMapper([], '', [], $this->entityManagerProphecy->reveal());

    $graphqlElement = ParagraphMaterialGridManual::make(
      id: 'grid_manual_1',
      materialGridDescription: 'Hand-picked books from the wizarding world',
      materialGridTitle: 'Magical Favorites',
      materialGridWorkIds: [
        WorkId::make(material_type: 'book', work_id: 'chamber-of-secrets'),
        WorkId::make(material_type: 'book', work_id: 'fantastic-beasts'),
      ]
    );

    $result = $mapper->map($graphqlElement);

    $this->assertSame($result, $this->entityProphecy->reveal());
  }

}
