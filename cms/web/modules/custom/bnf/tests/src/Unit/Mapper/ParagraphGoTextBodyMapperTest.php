<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Body\Text;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoTextBody;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphGoTextBodyMapper;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Tests the go_text_body paragraph mapper.
 */
class ParagraphGoTextBodyMapperTest extends EntityMapperTestBase {

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
   * Test go text paragraph mapping.
   */
  public function testParagraphGoTextBodyMapping(): void {
    $this->storageProphecy->create([
      'type' => 'go_text_body',
    ])->willReturn($this->entityProphecy);

    $mapper = new ParagraphGoTextBodyMapper([], '', [], $this->entityManagerProphecy->reveal());

    $graphqlElement = ParagraphGoTextBody::make(
      id: 'goTextBody',
      body: Text::make(
        format: 'go_format', value: 'Go text content')
    );

    $paragraph = $mapper->map($graphqlElement);

    $this->assertSame($paragraph, $this->entityProphecy->reveal());

    $this->entityProphecy->set('field_body', [
      'value' => 'Go text content',
      'format' => 'go_format',
    ])->shouldHaveBeenCalled();
  }

}
