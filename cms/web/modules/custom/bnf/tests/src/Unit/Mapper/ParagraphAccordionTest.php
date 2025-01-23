<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\AccordionDescription\Text as GraphqlDescriptionText;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\AccordionTitle\Text as GraphqlTitleText;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphAccordion as GraphqlParagraphAccordion;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphAccordion;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Tests the text_body paragraph mapper.
 */
class ParagraphAccordionTest extends EntityMapperTestBase {

  const ENTITY_NAME = 'paragraph';
  const ENTITY_CLASS = Paragraph::class;

  /**
   * Test text paragraph mapping.
   */
  public function testParagraphTextBodyMapping(): void {
    $this->storageProphecy->create([
      'type' => 'accordion',
    ])->willReturn($this->entityProphecy);

    $mapper = new ParagraphAccordion([], '', [], $this->entityManagerProphecy->reveal());

    $graphqlArticle = GraphqlParagraphAccordion::make(
      GraphqlTitleText::make('This is the title', 'format1'),
      GraphqlDescriptionText::make('This is the description', 'format2'),
    );

    $paragraph = $mapper->map($graphqlArticle);

    $this->assertSame($paragraph, $this->entityProphecy->reveal());

    $this->entityProphecy->set('field_accordion_title', [
      'value' => 'This is the title',
      'format' => 'format1',
    ])->shouldHaveBeenCalled();

    $this->entityProphecy->set('field_accordion_description', [
      'value' => 'This is the description',
      'format' => 'format2',
    ])->shouldHaveBeenCalled();
  }

}
