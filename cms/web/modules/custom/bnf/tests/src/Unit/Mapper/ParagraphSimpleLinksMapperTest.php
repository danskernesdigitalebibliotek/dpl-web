<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Link\Link;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphSimpleLinks;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphSimpleLinksMapper;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Tests the simple_links paragraph mapper.
 */
class ParagraphSimpleLinksMapperTest extends EntityMapperTestBase {

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
   * Test simple links paragraph mapping.
   */
  public function testParagraphSimpleLinksMapping(): void {
    $this->storageProphecy->create([
      'type' => 'simple_links',
      'field_link' => [
        ['uri' => 'https://diagon.alley', 'title' => 'Shop at Diagon Alley'],
        ['uri' => 'https://owl.post', 'title' => 'Send an Owl'],
      ],
    ])->willReturn($this->entityProphecy)->shouldBeCalled();

    $mapper = $this->getMockBuilder(ParagraphSimpleLinksMapper::class)
      ->setConstructorArgs([
        [],
        '',
        [],
        $this->entityManagerProphecy->reveal(),
      ])
      ->onlyMethods(['getLinkValue'])
      ->getMock();

    $mapper->method('getLinkValue')->willReturnOnConsecutiveCalls(
      ['uri' => 'https://diagon.alley', 'title' => 'Shop at Diagon Alley'],
      ['uri' => 'https://owl.post', 'title' => 'Send an Owl']
    );

    $graphqlElement = ParagraphSimpleLinks::make(
      id: 'simple_links_1',
      link: [
        Link::make(internal: FALSE, title: 'Shop at Diagon Alley', url: 'https://diagon.alley'),
        Link::make(internal: FALSE, title: 'Send an Owl', url: 'https://owl.post'),
      ]
    );

    $result = $mapper->map($graphqlElement);

    $this->assertSame($result, $this->entityProphecy->reveal());
  }

}
