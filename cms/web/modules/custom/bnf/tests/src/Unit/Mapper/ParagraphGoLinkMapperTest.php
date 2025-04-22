<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\LinkRequired\Link;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\GoLinkParagraph\ParagraphGoLink;
use Drupal\bnf\Plugin\bnf_mapper\ParagraphGoLinkMapper;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Url;
use Drupal\node\Entity\Node;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Tests the go_link paragraph mapper.
 */
class ParagraphGoLinkMapperTest extends EntityMapperTestBase {

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
   * Test go link paragraph mapping.
   */
  public function testParagraphGoLinkMapping(): void {
    $this->storageProphecy->create([
      'type' => 'go_link',
    ])->willReturn($this->entityProphecy);

    $manager = $this->prophesize(BnfMapperManager::class);

    $mapper = new ParagraphGoLinkMapper(
      [],
      '',
      [],
      $this->entityManagerProphecy->reveal(),
      $manager->reveal(),
    );

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

    $paragraph = $mapper->map($graphqlElement);

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

    $manager = $this->prophesize(BnfMapperManager::class);

    // Prophesize existing node.
    $urlProphecy = $this->prophesize(Url::class);
    $urlProphecy->toString()->willReturn('/our-url');
    $nodeProphecy = $this->prophesize(Node::class);
    $nodeProphecy->toUrl()->willReturn($urlProphecy);
    $nodeStorage = $this->prophesize(EntityStorageInterface::class);
    $nodeStorage->loadByProperties(['uuid' => 'content-uuid'])->willReturn([$nodeProphecy]);
    $this->entityManagerProphecy->getStorage('node')->willReturn($nodeStorage);


    $mapper = new ParagraphGoLinkMapper(
      [],
      '',
      [],
      $this->entityManagerProphecy->reveal(),
      $manager->reveal(),
    );

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

    $paragraph = $mapper->map($graphqlElement);

    $this->assertSame($paragraph, $this->entityProphecy->reveal());

    $this->entityProphecy->set('field_aria_label', 'aria-label')->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_target_blank', FALSE)->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_target_blank', FALSE)->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_go_link', [
      'uri' => '/our-url',
      'title' => 'Link',
    ])->shouldHaveBeenCalled();
  }

}
