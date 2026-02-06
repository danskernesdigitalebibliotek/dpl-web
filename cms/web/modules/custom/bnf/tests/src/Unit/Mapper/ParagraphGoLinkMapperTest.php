<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\LinkRequired\Link;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoLink;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphGoLinkMapper;
use Drupal\paragraphs\Entity\Paragraph;
use Prophecy\Argument;

/**
 * Tests the go_link paragraph mapper.
 */
class ParagraphGoLinkMapperTest extends EntityMapperTestBase {

  /**
   * The subject under test.
   */
  protected ParagraphGoLinkMapper $mapper;

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
    $manager->map(Argument::any())->willReturn(['fake' => 'link mapper']);

    $this->mapper = new ParagraphGoLinkMapper(
      [],
      '',
      [],
      $this->entityManagerProphecy->reveal(),
      $manager->reveal(),
    );
  }

  /**
   * Test go link paragraph mapping.
   */
  public function testParagraphGoLinkMapping(): void {
    $this->storageProphecy->create([
      'type' => 'go_link',
    ])->willReturn($this->entityProphecy);

    $graphqlElement = ParagraphGoLink::make(
      id: 'paragraph-id',
      ariaLabel: 'aria-label',
      targetBlank: FALSE,
      linkRequired: Link::make(
        internal: FALSE,
        title: 'DR.dk',
        url: 'https://dr.dk/',
        id: NULL,
      ),
    );

    $paragraph = $this->mapper->map($graphqlElement);

    $this->assertSame($paragraph, $this->entityProphecy->reveal());

    $this->entityProphecy->set('field_aria_label', 'aria-label')->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_target_blank', FALSE)->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_target_blank', FALSE)->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_go_link', ['fake' => 'link mapper'])->shouldHaveBeenCalled();
  }

}
