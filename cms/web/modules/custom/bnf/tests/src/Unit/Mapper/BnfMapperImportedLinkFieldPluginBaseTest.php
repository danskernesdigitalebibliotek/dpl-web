<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\LinkRequired\Link;
use Drupal\bnf\ImportContext;
use Drupal\bnf\Plugin\bnf_mapper\FieldGoLinkRequiredMapper;
use Drupal\bnf\Services\BnfImporter;
use Drupal\bnf\Services\ImportContextStack;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Url;
use Drupal\node\Entity\Node;
use Drupal\Tests\UnitTestCase;
use Prophecy\Argument;
use Prophecy\Prophecy\ObjectProphecy;

/**
 * Test BnfMapperImportedLinkFieldPluginBase.
 *
 * In practice tested via FieldGoLinkRequiredMapper as we need a concrete class
 * to test.
 *
 * Implicitly tests all the subclasses.
 */
class BnfMapperImportedLinkFieldPluginBaseTest extends UnitTestCase {

  /**
   * The subject under test.
   */
  protected FieldGoLinkRequiredMapper $mapper;

  /**
   * Entity type manager prophecy.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\EntityTypeManagerInterface>
   */
  protected ObjectProphecy $entityTypeManager;

  /**
   * Entity (node) storage prophecy.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\EntityStorageInterface>
   */
  protected ObjectProphecy $entityStorage;

  /**
   * Import context stack prophecy.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\bnf\Services\ImportContextStack>
   */
  protected ObjectProphecy $importContextStack;

  /**
   * Import context prophecy.
   *
   * @var \Drupal\bnf\ImportContext
   */
  protected ImportContext $importContext;

  /**
   * BnfImporter prophecy.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\bnf\Services\BnfImporter>
   */
  protected ObjectProphecy $importer;

  /**
   * {@inheritdoc}
   */
  public function setUp(): void {
    parent::setUp();
    $this->entityTypeManager = $this->prophesize(EntityTypeManagerInterface::class);

    $this->entityStorage = $this->prophesize(EntityStorageInterface::class);
    $this->entityStorage->loadByProperties(Argument::any())->willReturn([]);
    $this->entityTypeManager->getStorage('node')->willReturn($this->entityStorage);

    $this->importContext = new ImportContext('some endpoint');

    $this->importContextStack = $this->prophesize(ImportContextStack::class);
    $this->importContextStack->current()->willReturn($this->importContext);
    $this->importContextStack->size()->willReturn(1);

    $this->importer = $this->prophesize(BnfImporter::class);

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

    $this->prophesizeExistingNode('content-uuid', '/our-url');

    $expected = [
      'uri' => '/our-url',
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

    $this->prophesizeImportedNode('content-uuid', '/our-url');

    $expected = [
      'uri' => '/our-url',
      'title' => 'Link',
    ];

    $this->assertEquals($expected, $this->mapper->map($graphqlElement));
  }

  /**
   * Test that content is skipped if recursion is too high.
   */
  public function testRecursionLimit(): void {
    $graphqlElement = Link::make(
      internal: TRUE,
      title: 'Link',
      url: 'https://some/url',
      id: 'content-uuid',
    );

    $this->importContextStack->size()->willReturn(5);

    $this->assertNull($this->mapper->map($graphqlElement));
  }

  /**
   * Prophesize an existing node with UUID and URL.
   */
  protected function prophesizeExistingNode(string $uuid, string $url): void {
    $nodeProphecy = $this->prophesizeNode($url);

    $this->entityStorage->loadByProperties(['uuid' => $uuid])->willReturn([$nodeProphecy]);
  }

  protected function prophesizeImportedNode(string $uuid, string $url): void {
    $nodeProphecy = $this->prophesizeNode($url);

    $this->importer->importNode($uuid, $this->importContext)->willReturn($nodeProphecy);
  }

  /**
   * Prophesize a node.
   *
   * @return \Prophecy\Prophecy\ObjectProphecy<\Drupal\node\Entity\Node>
   */
  protected function prophesizeNode(string $url): ObjectProphecy {
    $urlProphecy = $this->prophesize(Url::class);
    $urlProphecy->toString()->willReturn($url);

    $nodeProphecy = $this->prophesize(Node::class);
    $nodeProphecy->toUrl()->willReturn($urlProphecy);

    return $nodeProphecy;
  }
}
