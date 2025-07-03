<?php

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\Plugin\bnf_mapper\BnfMapperImportReferencePluginBase;
use Drupal\bnf\Plugin\bnf_mapper\FieldGoLinkRequiredMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\LinkRequired\Link;

/**
 * Testing importing of reference-links.
 */
class FieldGoLinkRequiredMapperTest extends BnfMapperImportReferencePluginBaseTest {

  /**
   * {@inheritDoc}
   */
  public function setUp(): void {
    parent::setUp();

    $this->mapper = new FieldGoLinkRequiredMapper(
      [],
      '',
      [],
      $this->entityTypeManager->reveal(),
      $this->importContextStack->reveal(),
      $this->importer->reveal(),
    );
  }

  /**
   * Test that simple external links are mapped correctly.
   */
  public function testExternalUrlMapping(): void {
    $graphqlElement = Link::make(
      internal: FALSE,
      title: 'DR.dk',
      url: 'https://dr.dk/',
      id: NULL,
    );

    $expected = [
      'uri' => 'https://dr.dk/',
      'title' => 'DR.dk',
    ];

    $this->assertEquals($expected, $this->mapper->map($graphqlElement));
  }

  /**
   * Test that it works for content that already exist.
   */
  public function testMappingExistingContent(): void {
    $graphqlElement = Link::make(
      internal: TRUE,
      title: 'Link',
      url: 'https://some/url',
      id: 'content-uuid',
    );

    $this->prophesizeExistingNode('13', 'content-uuid');

    $expected = [
      'uri' => 'entity:node/13',
      'title' => 'Link',
    ];

    $this->assertEquals($expected, $this->mapper->map($graphqlElement));
  }

  /**
   * Test that new content gets created.
   */
  public function testMappingNewContent(): void {
    $graphqlElement = Link::make(
      internal: TRUE,
      title: 'Link',
      url: 'https://some/url',
      id: 'content-uuid',
    );

    $this->prophesizeImportedNode('113', 'content-uuid');

    $expected = [
      'uri' => 'entity:node/113',
      'title' => 'Link',
    ];

    $this->assertEquals($expected, $this->mapper->map($graphqlElement));
  }

  /**
   * Test that content is skipped if recursion is too high.
   */
  public function testRecursionLimit(): void {
    $limit = BnfMapperImportReferencePluginBase::$recursionLimit;

    $graphqlElement = Link::make(
      internal: TRUE,
      title: 'Link',
      url: 'https://some/url',
      id: 'content-uuid',
    );

    $this->prophesizeImportedNode('113', 'content-uuid');

    $this->importContextStack->size()->willReturn($limit - 1);
    $this->assertNotNull($this->mapper->map($graphqlElement));

    $this->importContextStack->size()->willReturn($limit + 1);
    $this->assertNull($this->mapper->map($graphqlElement));

  }

}
