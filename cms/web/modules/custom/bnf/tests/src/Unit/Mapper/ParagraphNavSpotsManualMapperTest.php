<?php

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphNavSpotsManual;
use Drupal\bnf\Plugin\bnf_mapper\BnfMapperImportReferencePluginBase;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphNavSpotsManualMapper;
use Drupal\paragraphs\Entity\Paragraph;
use Prophecy\Prophecy\ObjectProphecy;

/**
 * Testing the nav_spots_manual mapper.
 */
class ParagraphNavSpotsManualMapperTest extends BnfMapperImportReferencePluginBaseTest {

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

    $this->mapper = new ParagraphNavSpotsManualMapper(
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
   * Test that supplying UUIDs will import nodes.
   */
  public function testReferenceImport(): void {
    $limit = BnfMapperImportReferencePluginBase::$recursionLimit;

    $uuids = [];
    $expectedNavSpotContent = [];

    for ($i = 1; $i < ($limit); $i++) {
      $uuid = "content-uuid-$i";
      $uuids[] = $uuid;

      $this->prophesizeImportedNode($i, $uuid);

      $expectedNavSpotContent[] = [
        'target_id' => $i,
        'target_type' => 'node',
      ];
    }

    $graphqlElement = ParagraphNavSpotsManual::make(
      'nav-spots-id',
      $uuids
    );

    $this->paragraphStorage->create([
      'type' => 'nav_spots_manual',
      'field_nav_spots_content' => $expectedNavSpotContent,
    ])->willReturn($this->entityProphecy)->shouldBeCalled();

    $this->assertSame($this->mapper->map($graphqlElement), $this->entityProphecy->reveal());
  }

}
