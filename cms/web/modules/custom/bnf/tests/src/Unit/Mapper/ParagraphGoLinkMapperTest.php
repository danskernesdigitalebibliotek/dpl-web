<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\LinkRequired\Link;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoLink;
use Drupal\bnf\ImportContext;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphGoLinkMapper;
use Drupal\bnf\Services\BnfImporter;
use Drupal\bnf\Services\ImportContextStack;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Url;
use Drupal\node\Entity\Node;
use Drupal\paragraphs\Entity\Paragraph;

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

    $this->importContextStack = $this->prophesize(ImportContextStack::class);
    $this->importContextStack->size()->willReturn(1);

    $this->importer = $this->prophesize(BnfImporter::class);

    $this->mapper = new ParagraphGoLinkMapper(
      [],
      '',
      [],
      $this->entityManagerProphecy->reveal(),
      $manager->reveal(),
      $this->importContextStack->reveal(),
      $this->importer->reveal(),
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
      targetBlank: false,
      linkRequired: Link::make(
        internal: false,
        title: 'DR.dk',
        url: 'https://dr.dk/',
        id: null,
      ),
    );

    $paragraph = $this->mapper->map($graphqlElement);

    $this->assertSame($paragraph, $this->entityProphecy->reveal());

    $this->entityProphecy->set('field_aria_label', 'aria-label')->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_target_blank', FALSE)->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_target_blank', FALSE)->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_go_link', [
      'uri' => 'https://dr.dk/',
      'title' => 'DR.dk',
    ])->shouldHaveBeenCalled();
  }

  /**
   * Test internal mapping to existing nodes.
   */
  public function testInternalMappingToExistingContent(): void {
    $this->storageProphecy->create([
      'type' => 'go_link',
    ])->willReturn($this->entityProphecy);

    // Prophesize existing node.
    $urlProphecy = $this->prophesize(Url::class);
    $urlProphecy->toString()->willReturn('/our-url');
    $nodeProphecy = $this->prophesize(Node::class);
    $nodeProphecy->toUrl()->willReturn($urlProphecy);
    $nodeStorage = $this->prophesize(EntityStorageInterface::class);
    $nodeStorage->loadByProperties(['uuid' => 'content-uuid'])->willReturn([$nodeProphecy]);
    $this->entityManagerProphecy->getStorage('node')->willReturn($nodeStorage);

    $graphqlElement = ParagraphGoLink::make(
      id: 'paragraph-id',
      ariaLabel: 'aria-label',
      targetBlank: false,
      linkRequired: Link::make(
        internal: true,
        title: 'Link',
        url: '/someurl',
        id: 'content-uuid',
      ),
    );

    $paragraph = $this->mapper->map($graphqlElement);

    $this->assertSame($paragraph, $this->entityProphecy->reveal());

    $this->entityProphecy->set('field_aria_label', 'aria-label')->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_target_blank', FALSE)->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_target_blank', FALSE)->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_go_link', [
      'uri' => '/our-url',
      'title' => 'Link',
    ])->shouldHaveBeenCalled();
  }

  /**
   * Test internal mapping to non-existing nodes.
   */
  public function testInternalMappingToNewContent(): void {
    $this->storageProphecy->create([
      'type' => 'go_link',
    ])->willReturn($this->entityProphecy);

    // No existing node.
    $nodeStorage = $this->prophesize(EntityStorageInterface::class);
    $nodeStorage->loadByProperties(['uuid' => 'content-uuid'])->willReturn([]);
    $this->entityManagerProphecy->getStorage('node')->willReturn($nodeStorage);

    // Prophesize new node.
    $urlProphecy = $this->prophesize(Url::class);
    $urlProphecy->toString()->willReturn('/new-url');
    $nodeProphecy = $this->prophesize(Node::class);
    $nodeProphecy->toUrl()->willReturn($urlProphecy);

    $importConfig = new ImportContext('some endpoint');

    $this->importContextStack->current()->willReturn($importConfig);
    $this->importer->importNode('content-uuid', $importConfig)->willReturn($nodeProphecy);

    $graphqlElement = ParagraphGoLink::make(
      id: 'paragraph-id',
      ariaLabel: 'aria-label',
      targetBlank: false,
      linkRequired: Link::make(
        internal: true,
        title: 'Link',
        url: '/someurl',
        id: 'content-uuid',
      ),
    );

    $paragraph = $this->mapper->map($graphqlElement);

    $this->assertSame($paragraph, $this->entityProphecy->reveal());

    $this->entityProphecy->set('field_aria_label', 'aria-label')->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_target_blank', FALSE)->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_target_blank', FALSE)->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_go_link', [
      'uri' => '/new-url',
      'title' => 'Link',
    ])->shouldHaveBeenCalled();
  }


  /**
   * Test recursion limit.
   */
  public function testRecursionLimit(): void {
    $this->storageProphecy->create([
      'type' => 'go_link',
    ])->willReturn($this->entityProphecy);

    // No existing node.
    $nodeStorage = $this->prophesize(EntityStorageInterface::class);
    $nodeStorage->loadByProperties(['uuid' => 'content-uuid'])->willReturn([]);
    $this->entityManagerProphecy->getStorage('node')->willReturn($nodeStorage);

    $importConfig = new ImportContext('some endpoint');

    $this->importContextStack->current()->willReturn($importConfig);
    $this->importContextStack->size()->willReturn(5);

    $graphqlElement = ParagraphGoLink::make(
      id: 'paragraph-id',
      ariaLabel: 'aria-label',
      targetBlank: false,
      linkRequired: Link::make(
        internal: true,
        title: 'Link',
        url: '/someurl',
        id: 'content-uuid',
      ),
    );

    $paragraph = $this->mapper->map($graphqlElement);

    $this->assertNull($paragraph);
  }

}
