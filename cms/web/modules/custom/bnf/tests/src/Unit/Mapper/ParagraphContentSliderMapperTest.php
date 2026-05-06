<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ContentReferences\NodePage;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphContentSlider;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\UnderlinedTitle\Text;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphContentSliderMapper;
use Drupal\paragraphs\Entity\Paragraph;
use Prophecy\Prophecy\ObjectProphecy;

/**
 * Testing the content_slider mapper.
 */
class ParagraphContentSliderMapperTest extends BnfMapperImportReferencePluginBaseTest {

  /**
   * Entity prophecy.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\EntityBase>
   */
  protected ObjectProphecy $entityProphecy;

  /**
   * {@inheritDoc}
   */
  public function setUp(): void {
    parent::setUp();

    $this->mapper = new ParagraphContentSliderMapper(
      [],
      '',
      [],
      $this->entityTypeManager->reveal(),
      $this->importContextStack->reveal(),
      $this->importer->reveal(),
      $this->prophesize(BnfMapperManager::class)->reveal(),
    );

    $this->entityProphecy = $this->prophesize(Paragraph::class);
  }

  /**
   * Test mapping a content slider paragraph.
   */
  public function testReferenceImport(): void {
    $contentReferences = [];
    $expectedContentReferences = [];

    for ($i = 1; $i <= 3; $i++) {
      $uuid = "content-uuid-$i";

      $this->prophesizeImportedNode((string) $i, $uuid);

      $nodeReference = NodePage::make(
        id: $uuid,
      );
      $contentReferences[] = $nodeReference;

      $expectedContentReferences[] = [
        'target_id' => (string) $i,
        'target_type' => 'node',
      ];
    }

    $graphqlElement = ParagraphContentSlider::make(
      id: 'random',
      underlinedTitle: Text::make(
        format: 'basic_html',
        value: 'Underlined title value',
      ),
      contentReferences: $contentReferences,
    );

    $this->paragraphStorage->create([
      'type' => 'content_slider',
      'field_title' => '',
      'field_underlined_title' => [
        'value' => 'Underlined title value',
        'format' => 'basic_html',
      ],
      'field_content_references' => $expectedContentReferences,
    ])->willReturn($this->entityProphecy)->shouldBeCalled();

    $this->assertsame($this->mapper->map($graphqlElement), $this->entityProphecy->reveal());
  }

}
