<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\BannerLink\Link;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphBanner;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\UnderlinedTitle\Text;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphBannerMapper;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\FileRepositoryInterface;
use Drupal\paragraphs\Entity\Paragraph;
use Prophecy\Argument;

/**
 * Tests the banner paragraph mapper (excluding image).
 */
class ParagraphBannerMapperTest extends EntityMapperTestBase {

  /**
   * The subject under test.
   */
  protected ParagraphBannerMapper $mapper;

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

    $this->mapper = new ParagraphBannerMapper(
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
      'field_banner_link' => ['fake' => 'link mapper'],
      'field_banner_image' => [],
    ])->willReturn($this->entityProphecy)->shouldBeCalled();

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

    $result = $this->mapper->map($graphqlElement);

    $this->assertSame($this->entityProphecy->reveal(), $result);
  }

}
