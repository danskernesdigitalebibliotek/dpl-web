<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridLinkAutomatic;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphMaterialGridLinkAutomaticMapper;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Tests the material_grid_link_automatic paragraph mapper.
 */
class ParagraphMaterialGridLinkAutomaticMapperTest extends EntityMapperTestBase {

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
   * Test material grid link automatic paragraph mapping.
   */
  public function testParagraphMaterialGridLinkAutomaticMapping(): void {
    $this->storageProphecy->create([
      'type' => 'material_grid_link_automatic',
      'field_material_grid_title' => 'Recommended Reading',
      'field_material_grid_description' => 'Books from the Hogwarts library',
      'field_material_amount' => 5,
      'field_material_grid_link' => 'https://example.com/magic',
    ])->willReturn($this->entityProphecy)->shouldBeCalled();

    $mapper = new ParagraphMaterialGridLinkAutomaticMapper(
      [],
      '',
      [],
      $this->entityManagerProphecy->reveal(),
    );

    $graphqlElement = ParagraphMaterialGridLinkAutomatic::make(
      id: 'grid_link_auto_1',
      materialAmount: 5,
      materialGridLink: 'https://example.com/magic',
      materialGridDescription: 'Books from the Hogwarts library',
      materialGridTitle: 'Recommended Reading'
    );

    $result = $mapper->map($graphqlElement);

    $this->assertSame($result, $this->entityProphecy->reveal());
  }

}
