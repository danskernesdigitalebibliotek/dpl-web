<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ContentReferences\NodePage;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphContentSlider;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\UnderlinedTitle\Text;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphContentSliderMapper;

/**
 * Testing the content_slider mapper.
 */
class ParagraphContentSliderMapperTest extends BnfMapperImportReferencePluginBaseTest {

  /**
   * {@inheritDoc}
   */
  public function setUp(): void {
    parent::setUp();

    $this->mapper = new ParagraphContentSliderMapper(
      [],
      '',
      [],
    );
  }

  /**
   * Test that we're not mapping anything.
   */
  public function testThatContentSliderIsntImported(): void {
    $contentReferences = [];

    for ($i = 1; $i <= 3; $i++) {
      $uuid = "content-uuid-$i";

      $nodeReference = NodePage::make(id: $uuid);
      $contentReferences[] = $nodeReference;
    }

    $graphqlElement = ParagraphContentSlider::make(
      id: 'random',
      underlinedTitle: Text::make(
        format: 'basic_html',
        value: 'Underlined title value',
      ),
      contentReferences: $contentReferences,
    );

    $this->assertsame($this->mapper->map($graphqlElement), []);
  }

}
