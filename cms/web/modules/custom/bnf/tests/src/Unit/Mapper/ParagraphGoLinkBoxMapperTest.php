<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\LinkRequired\Link;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoLink;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoLinkbox;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphGoLinkboxMapper;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Tests the go_linkbox paragraph mapper (excluding image).
 */
class ParagraphGoLinkBoxMapperTest extends EntityMapperTestBase {

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
   * Test go linkbox paragraph mapping without image field.
   */
  public function testParagraphGoLinkBoxMapping(): void {
    $goLinkParagraph = $this->prophesize(Paragraph::class);
    $goLinkParagraph->id()->willReturn(88);
    $goLinkParagraph->getRevisionId()->willReturn(888);
    $goLinkParagraph->save()->shouldBeCalled();

    $this->storageProphecy->create([
      'type' => 'go_link',
      'field_aria_label' => 'Accessible link',
      'field_target_blank' => TRUE,
      'field_go_link' => [
        'uri' => 'https://foo.bar',
        'title' => 'Link title',
      ],
    ])->willReturn($goLinkParagraph->reveal())->shouldBeCalled();

    $this->storageProphecy->create([
      'type' => 'go_linkbox',
      'field_go_color' => 'mint',
      'field_go_description' => 'A short description',
      'field_go_image' => [],
      'field_go_link_paragraph' => [[
        'target_id' => 88,
        'target_revision_id' => 888,
      ],
      ],
      'field_title' => 'Linkbox title',
    ])->willReturn($this->entityProphecy)->shouldBeCalled();

    $mapper = $this->getMockBuilder(ParagraphGoLinkboxMapper::class)
      ->setConstructorArgs([
        [],
        '',
        [],
        $this->entityManagerProphecy->reveal(),
        $this->fileSystemProphecy->reveal(),
        $this->fileRepositoryProphecy->reveal(),
      ])
      ->onlyMethods(['getImageValue', 'getLinkValue'])
      ->getMock();

    $mapper->method('getImageValue')->willReturn([]);
    $mapper->method('getLinkValue')->willReturn([
      'uri' => 'https://foo.bar',
      'title' => 'Link title',
    ]);

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

    $result = $mapper->map($graphqlElement);
    $this->assertSame($result, $this->entityProphecy->reveal());
  }

}
