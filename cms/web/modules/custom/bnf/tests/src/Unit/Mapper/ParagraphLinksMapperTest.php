<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Link\Link;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphLinks;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphLinksMapper;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Tests the links paragraph mapper.
 */
class ParagraphLinksMapperTest extends EntityMapperTestBase {

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
   * Test links paragraph mapping.
   */
  public function testParagraphLinksMapping(): void {
    $this->storageProphecy->create([
      'type' => 'links',
      'field_link' => [
        ['uri' => 'https://example.com', 'title' => 'Visit Hogwarts'],
        ['uri' => 'https://library.example', 'title' => 'Restricted Section'],
      ],
    ])->willReturn($this->entityProphecy)->shouldBeCalled();

    $mapper = $this->getMockBuilder(ParagraphLinksMapper::class)
      ->setConstructorArgs([
        [],
        '',
        [],
        $this->entityManagerProphecy->reveal(),
      ])
      ->onlyMethods(['getLinkValue'])
      ->getMock();

    $mapper->method('getLinkValue')->willReturnOnConsecutiveCalls(
      ['uri' => 'https://example.com', 'title' => 'Visit Hogwarts'],
      ['uri' => 'https://library.example', 'title' => 'Restricted Section']
    );

    $graphqlElement = ParagraphLinks::make(
      id: 'links_para_1',
      link: [
        Link::make(internal: FALSE, title: 'Visit Hogwarts', url: 'https://example.com'),
        Link::make(internal: FALSE, title: 'Restricted Section', url: 'https://library.example'),
      ]
    );

    $result = $mapper->map($graphqlElement);

    $this->assertSame($result, $this->entityProphecy->reveal());
  }

}
