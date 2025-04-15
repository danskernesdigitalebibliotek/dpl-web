<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphRecommendation;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\RecommendationTitle\Text;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\RecommendationWorkId\WorkId;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphRecommendationMapper;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Tests the recommendation paragraph mapper.
 */
class ParagraphRecommendationMapperTest extends EntityMapperTestBase {

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
   * Test recommendation paragraph mapping.
   */
  public function testParagraphRecommendationMapping(): void {
    $this->storageProphecy->create([
      'type' => 'recommendation',
      'field_image_position_right' => TRUE,
      'field_recommendation_description' => 'A must-read magical tale',
      'field_recommendation_title' => [
        'value' => 'Read This!',
        'format' => 'rich_text',
      ],
      'field_recommendation_work_id' => [
        'value' => 'order-of-the-phoenix',
        'material_type' => 'book',
      ],
    ])->willReturn($this->entityProphecy)->shouldBeCalled();

    $mapper = $this->getMockBuilder(ParagraphRecommendationMapper::class)
      ->setConstructorArgs([
        [],
        '',
        [],
        $this->entityManagerProphecy->reveal(),
      ])
      ->onlyMethods(['getMaterialValue'])
      ->getMock();

    $mapper->method('getMaterialValue')->willReturn([
      'value' => 'order-of-the-phoenix',
      'material_type' => 'book',
    ]);

    $graphqlElement = ParagraphRecommendation::make(
      id: 'recommendation_1',
      imagePositionRight: TRUE,
      recommendationDescription: 'A must-read magical tale',
      recommendationTitle: Text::make(
        format: 'rich_text',
        value: 'Read This!',
      ),
      recommendationWorkId: WorkId::make(
        material_type: 'book',
        work_id: 'order-of-the-phoenix'
      )
    );

    $result = $mapper->map($graphqlElement);

    $this->assertSame($result, $this->entityProphecy->reveal());
  }

}
