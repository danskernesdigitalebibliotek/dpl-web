<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Body\Text as GraphqlText;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphTextBody as GraphqlParagraphTextBody;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphTextBody;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Tests the text_body paragraph mapper.
 */
class ParagraphTextBodyTest extends EntityMapperTestBase {

  const ENTITY_NAME = 'paragraph';
  const ENTITY_CLASS = Paragraph::class;

  /**
   * Test text paragraph mapping.
   */
  public function testParagraphTextBodyMapping(): void {
    $this->storageProphecy->create([
      'type' => 'text_body',
    ])->willReturn($this->entityProphecy);

    $mapper = new ParagraphTextBody([], '', [], $this->entityManagerProphecy->reveal());

    $graphqlArticle = GraphqlParagraphTextBody::make(
      GraphqlText::make('This is the text', 'with_format')
    );

    $paragraph = $mapper->map($graphqlArticle);

    $this->assertSame($paragraph, $this->entityProphecy->reveal());
    $this->entityProphecy->set('field_body', [
      'value' => 'This is the text',
      'format' => 'with_format',
    ])->shouldHaveBeenCalled();
  }

}
