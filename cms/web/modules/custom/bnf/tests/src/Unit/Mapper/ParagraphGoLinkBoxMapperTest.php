<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\LinkRequired\Link;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoLink;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoLinkbox;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphGoLinkboxMapper;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\FileRepositoryInterface;
use Drupal\paragraphs\Entity\Paragraph;
use Prophecy\Argument;

/**
 * Tests the go_linkbox paragraph mapper (excluding image).
 */
class ParagraphGoLinkBoxMapperTest extends EntityMapperTestBase {

  /**
   * The subject under test.
   */
  protected ParagraphGoLinkboxMapper $mapper;

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
    $fileSystemProphecy = $this->prophesize(FileSystemInterface::class);
    $fileRepositoryProphecy = $this->prophesize(FileRepositoryInterface::class);

    $this->mapper = new ParagraphGoLinkboxMapper(
      [],
      '',
      [],
      $this->entityManagerProphecy->reveal(),
      $fileSystemProphecy->reveal(),
      $fileRepositoryProphecy->reveal(),
      $manager->reveal(),
    );
  }

  /**
   * Test go linkbox paragraph mapping without image field.
   */
  public function testParagraphGoLinkBoxMapping(): void {

    $this->storageProphecy->create([
      'type' => 'go_linkbox',
      'field_go_color' => 'mint',
      'field_go_description' => 'A short description',
      'field_go_image' => [],
      'field_title' => 'Linkbox title',
    ])->willReturn($this->entityProphecy)->shouldBeCalled();

    $this->entityProphecy->set('field_go_link_paragraph', [['fake' => 'link mapper']])->shouldBeCalled();

    $graphqlElement = ParagraphGoLinkbox::make(
      id: 'linkbox_1',
      title: 'Linkbox title',
      goDescription: 'A short description',
      goLinkParagraph: ParagraphGoLink::make(
        id: 'link',
        linkRequired: Link::make(
          internal: FALSE,
          title: 'Link title',
          url: 'https://foo.bar',
        ),
        targetBlank: TRUE,
        ariaLabel: 'Accessible link',
      ),
      goColor: 'mint',
      goImage: NULL
    );

    $result = $this->mapper->map($graphqlElement);
    $this->assertSame($result, $this->entityProphecy->reveal());
  }

}
