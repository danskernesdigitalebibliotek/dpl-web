<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\MaterialSliderWorkIds\WorkId;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoMaterialSliderManual;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphGoMaterialSliderManualMapper;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Tests the go_material_slider_manual paragraph mapper.
 */
class ParagraphGoMaterialSliderManualMapperTest extends EntityMapperTestBase {

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
   * Test go material slider manual paragraph mapping.
   */
  public function testParagraphGoMaterialSliderManualMapping(): void {
    $this->storageProphecy->create([
      'type' => 'go_material_slider_manual',
      'field_title' => 'Manual slider of book picks',
      'field_material_slider_work_ids' => [
        [
          'value' => 'harry-potter-1',
          'material_type' => 'book',
        ],
        [
          'value' => 'pride-and-prejudice',
          'material_type' => 'book',
        ],
      ],
    ])->willReturn($this->entityProphecy)->shouldBeCalled();

    $mapper = $this->getMockBuilder(ParagraphGoMaterialSliderManualMapper::class)
      ->setConstructorArgs([
        [],
        '',
        [],
        $this->entityManagerProphecy->reveal(),
      ])
      ->onlyMethods(['getMaterialValue'])
      ->getMock();

    $mapper->method('getMaterialValue')->willReturnOnConsecutiveCalls(
      ['value' => 'harry-potter-1', 'material_type' => 'book'],
      ['value' => 'pride-and-prejudice', 'material_type' => 'book']
    );

    $graphqlElement = ParagraphGoMaterialSliderManual::make(
      id: 'slider_manual_1',
      materialSliderWorkIds: [
        WorkId::make(material_type: 'book', work_id: 'harry-potter-1'),
        WorkId::make(material_type: 'book', work_id: 'pride-and-prejudice'),
      ],
      title: 'Manual slider of book picks'
    );

    $result = $mapper->map($graphqlElement);

    $this->assertSame($result, $this->entityProphecy->reveal());
  }

}
