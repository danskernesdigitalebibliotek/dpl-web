<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\AccordionDescription\Text as DescriptionText;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\AccordionTitle\Text as TitleText;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphAccordion;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphAccordionMapper;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Tests the text_body paragraph mapper.
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
   * Test text paragraph mapping.
   */
  public function testParagraphTextBodyMapping(): void {
    $this->storageProphecy->create([
      'type' => 'accordion',
    ])->willReturn($this->entityProphecy);

    $mapper = new ParagraphAccordionMapper([], '', [], $this->entityManagerProphecy->reveal());

    $graphqlArticle = ParagraphAccordion::make(
      TitleText::make('This is the title', 'format1'),
      DescriptionText::make('This is the description', 'format2'),
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
