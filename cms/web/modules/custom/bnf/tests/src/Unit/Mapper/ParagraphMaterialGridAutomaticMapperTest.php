<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\CqlSearch\CQLSearch;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridAutomatic;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphMaterialGridAutomaticMapper;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Tests the material_grid_automatic paragraph mapper.
 */
class ParagraphMaterialGridAutomaticMapperTest extends EntityMapperTestBase {

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
   * Test material grid automatic paragraph mapping.
   */
  public function testParagraphMaterialGridAutomaticMapping(): void {
    $this->storageProphecy->create([
      'type' => 'material_grid_automatic',
      'field_amount_of_materials' => 8,
      'field_material_grid_title' => 'Popular Wizarding Books',
      'field_material_grid_description' => 'A selection of magical literature',
      'field_cql_search' => ['value' => 'title any "magic"'],
    ])->willReturn($this->entityProphecy)->shouldBeCalled();

    $mapper = new ParagraphMaterialGridAutomaticMapper(
      [],
      '',
      [],
      $this->entityManagerProphecy->reveal(),
    );

    $graphqlElement = ParagraphMaterialGridAutomatic::make(
      id: 'auto_grid_1',
      cqlSearch: CQLSearch::make(value: 'title any "magic"'),
      amountOfMaterials: 8,
      materialGridDescription: 'A selection of magical literature',
      materialGridTitle: 'Popular Wizarding Books'
    );

    $result = $mapper->map($graphqlElement);

    $this->assertSame($result, $this->entityProphecy->reveal());
  }

}
