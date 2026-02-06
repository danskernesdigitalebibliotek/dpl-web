<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\CqlSearch\CQLSearch;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoMaterialSliderAutomatic;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphGoMaterialSliderAutomaticMapper;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Tests the go_material_slider_automatic paragraph mapper.
 */
class ParagraphGoMaterialSliderAutomaticMapperTest extends EntityMapperTestBase {

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
   * Test go material slider automatic paragraph mapping.
   */
  public function testParagraphGoMaterialSliderAutomaticMapping(): void {
    $this->storageProphecy->create([
      'type' => 'go_material_slider_automatic',
      'field_title' => 'Slider title',
      'field_slider_amount_of_materials' => 12,
      'field_cql_search' => [
        'value' => 'harry potter',
      ],
    ])->willReturn($this->entityProphecy)->shouldBeCalled();

    $mapper = new ParagraphGoMaterialSliderAutomaticMapper(
      [],
      '',
      [],
      $this->entityManagerProphecy->reveal(),
    );

    $graphqlElement = ParagraphGoMaterialSliderAutomatic::make(
      id: 'slider_auto_1',
      cqlSearch: CQLSearch::make(
        value: 'harry potter',
      ),
      sliderAmountOfMaterials: 12,
      title: 'Slider title'
    );

    $result = $mapper->map($graphqlElement);

    $this->assertSame($result, $this->entityProphecy->reveal());
  }

}
