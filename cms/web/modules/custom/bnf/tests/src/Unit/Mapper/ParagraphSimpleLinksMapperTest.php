<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Link\Link;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphSimpleLinks;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphSimpleLinksMapper;
use Drupal\paragraphs\Entity\Paragraph;
use Prophecy\Argument;

/**
 * Tests the simple_links paragraph mapper.
 */
class ParagraphSimpleLinksMapperTest extends EntityMapperTestBase {

  /**
   * The subject under test.
   */
  protected ParagraphSimpleLinksMapper $mapper;

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
   * {@inheritdoc}
   */
  public function setUp(): void {
    parent::setUp();
    $manager = $this->prophesize(BnfMapperManager::class);
    $manager->mapAll(Argument::any(), TRUE)->willReturn([['fake' => 'link mapper']]);

    $this->mapper = new ParagraphSimpleLinksMapper(
      [],
      '',
      [],
      $this->entityManagerProphecy->reveal(),
      $manager->reveal(),
    );
  }

  /**
   * Test simple links paragraph mapping.
   */
  public function testParagraphSimpleLinksMapping(): void {
    $this->storageProphecy->create([
      'type' => 'simple_links',
      'field_link' => [['fake' => 'link mapper']],
    ])->willReturn($this->entityProphecy)->shouldBeCalled();

    $graphqlElement = ParagraphSimpleLinks::make(
      id: 'simple_links_1',
      link: [
        Link::make(internal: FALSE, title: 'Shop at Diagon Alley', url: 'https://diagon.alley'),
      ]
    );

    $result = $this->mapper->map($graphqlElement);

    $this->assertSame($result, $this->entityProphecy->reveal());
  }

}
