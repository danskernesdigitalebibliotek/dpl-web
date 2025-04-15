<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Changed\DateTime as ChangedDateTime;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Created\DateTime as CreatedDateTime;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodePage;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\PublicationDate\DateTime as PublicationDateDateTime;
use Drupal\bnf\Plugin\bnf_mapper\NodePageMapper;
use Drupal\node\Entity\Node;

/**
 * Test the page node mapper.
 */
class NodePageMapperTest extends EntityMapperTestBase {

  /**
   * {@inheritdoc}
   */
  protected function getEntityName(): string {
    return 'node';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEntityClass(): string {
    return Node::class;
  }

  /**
   * Test article node mapping.
   */
  public function testNodeArticleMapping(): void {
    $this->storageProphecy->loadByProperties([
      'uuid' => '123',
    ])->willReturn([$this->entityProphecy]);

    $this->storageProphecy->create([
      'type' => 'page',
      'uuid' => '123',
    ])->willReturn($this->entityProphecy);

    $manager = $this->prophesize(BnfMapperManager::class);

    $mapper = new NodePageMapper(
      [],
      '',
      [],
      $manager->reveal(),
      $this->entityManagerProphecy->reveal(),
      $this->fileSystemProphecy->reveal(),
      $this->fileRepositoryProphecy->reveal(),
      $this->loggerProphecy->reveal(),
    );

    $graphql = NodePage::make(
      id: '123',
      title: 'this is the title',
      url: '/anbefalinger-til-mork-tid',
      status: TRUE,
      changed: ChangedDateTime::make(timestamp: 1735689661, timezone: 'UTC'),
      created: CreatedDateTime::make(timestamp: 1735689661, timezone: 'UTC'),
      publicationDate: PublicationDateDateTime::make(timestamp: 1735689661, timezone: 'UTC'),
      displayTitles: TRUE,
      heroTitle: 'this is the hero title',
    );

    $node = $mapper->map($graphql);

    $this->assertSame($node, $this->entityProphecy->reveal());
    $this->entityProphecy->set('status', Node::PUBLISHED)->shouldHaveBeenCalled();
    $this->entityProphecy->set('title', 'this is the title')->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_publication_date', ["value" => "2025-01-01"])->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_hero_title', 'this is the hero title')->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_display_titles', TRUE)->shouldHaveBeenCalled();

  }

}
