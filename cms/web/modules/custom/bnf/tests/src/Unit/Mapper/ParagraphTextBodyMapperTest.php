<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Body\Text;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphTextBody;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphTextBodyMapper;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Tests the text_body paragraph mapper.
 */
class ParagraphTextBodyMapperTest extends EntityMapperTestBase {

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
      'type' => 'text_body',
      'field_body' => [
        'value' => 'This is the text',
        'format' => 'with_format',
      ],
    ])->willReturn($this->entityProphecy);

    $mapper = new ParagraphTextBodyMapper([], '', [], $this->entityManagerProphecy->reveal());

    $graphqlElement = ParagraphTextBody::make(
      'textBody',
      Text::make('This is the text', 'with_format')
    );

    $paragraph = $mapper->map($graphqlElement);

    $this->assertSame($paragraph, $this->entityProphecy->reveal());
  }

}
