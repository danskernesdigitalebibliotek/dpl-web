<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\AccordionDescription\Text as DescriptionText;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\AccordionTitle\Text as TitleText;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphAccordion;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphAccordionMapper;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Tests the accordion paragraph mapper.
 */
class ParagraphAccordionMapperTest extends EntityMapperTestBase {

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
   * Test paragraph mapping.
   */
  public function testParagraphAccordionMapping(): void {
    $this->storageProphecy->create([
      'type' => 'accordion',
    ])->willReturn($this->entityProphecy);

    $mapper = new ParagraphAccordionMapper([], '', [], $this->entityManagerProphecy->reveal());

    $graphqlElement = ParagraphAccordion::make(
      id: 'accordion',
      accordionTitle: TitleText::make(
        format: 'format1',
        value: 'This is the title'
      ),
      accordionDescription: DescriptionText::make(
        format: 'format2', value: 'This is the description'),
    );

    $paragraph = $mapper->map($graphqlElement);

    $this->assertSame($paragraph, $this->entityProphecy->reveal());

    $this->entityProphecy->set('field_accordion_title', [
      'value' => 'This is the title',
      'format' => 'format1',
    ])->shouldHaveBeenCalled();

    $this->entityProphecy->set('field_accordion_description',
      [
        'value' => 'This is the description',
        'format' => 'format2',
      ])->shouldHaveBeenCalled();
  }

}
