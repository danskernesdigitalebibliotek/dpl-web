<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\BannerLink\Link;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphBanner;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\UnderlinedTitle\Text;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphBannerMapper;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Tests the banner paragraph mapper (excluding image).
 */
class ParagraphBannerMapperTest extends EntityMapperTestBase {

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
   * Test banner paragraph mapping without image field.
   */
  public function testParagraphBannerMapping(): void {
    $this->storageProphecy->create([
      'type' => 'banner',
      'field_underlined_title' => [
        'value' => 'Some title',
        'format' => 'basic_html',
      ],
      'field_banner_description' => 'This is a description',
      'field_banner_link' => [
        'uri' => 'https://foo.bar',
        'title' => 'Link title',
      ],
      'field_banner_image' => [],
    ])->willReturn($this->entityProphecy)->shouldBeCalled();

    $mapper = new ParagraphBannerMapper(
      [],
      '',
      [],
      $this->entityManagerProphecy->reveal(),
      $this->fileSystemProphecy->reveal(),
      $this->fileRepositoryProphecy->reveal(),
    );

    $graphqlElement = ParagraphBanner::make(
      id: 'banner_test',
      bannerLink: Link::make(
        internal: FALSE,
        title: 'Link title',
        url: 'https://foo.bar'
      ),
      bannerDescription: 'This is a description',
      bannerImage: NULL,
      underlinedTitle: Text::make(
        format: 'basic_html',
        value: 'Some title'
      ),
    );

    $result = $mapper->map($graphqlElement);

    $this->assertSame($this->entityProphecy->reveal(), $result);
  }

}
