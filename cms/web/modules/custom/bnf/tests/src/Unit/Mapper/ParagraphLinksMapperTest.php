<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Link\Link;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphLinks;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphLinksMapper;
use Drupal\paragraphs\Entity\Paragraph;
use Prophecy\Argument;

/**
 * Tests the links paragraph mapper.
 */
class ParagraphLinksMapperTest extends EntityMapperTestBase {

  /**
   * The subject under test.
   */
  protected ParagraphLinksMapper $mapper;

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
    $manager->mapAll(Argument::any())->willReturn([['fake' => 'link mapper']]);

    $this->mapper = new ParagraphLinksMapper(
      [],
      '',
      [],
      $this->entityManagerProphecy->reveal(),
      $manager->reveal(),
    );
  }

  /**
   * Test links paragraph mapping.
   */
  public function testParagraphLinksMapping(): void {
    $this->storageProphecy->create([
      'type' => 'links',
      'field_link' => [['fake' => 'link mapper']],
    ])->willReturn($this->entityProphecy)->shouldBeCalled();

    $graphqlElement = ParagraphLinks::make(
      id: 'links_para_1',
      link: [
        Link::make(internal: FALSE, title: 'Visit Hogwarts', url: 'https://example.com'),
        Link::make(internal: FALSE, title: 'Restricted Section', url: 'https://library.example'),
      ]
    );

    $result = $this->mapper->map($graphqlElement);

    $this->assertSame($result, $this->entityProphecy->reveal());
  }

}
