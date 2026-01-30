<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Changed\DateTime as ChangedDateTime;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Created\DateTime as CreatedDateTime;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeGoPage;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\PublicationDate\DateTime as PublicationDateDateTime;
use Drupal\bnf\Plugin\bnf_mapper\NodeGoPageMapper;
use Drupal\node\Entity\Node;

/**
 * Test the go_page node mapper.
 */
class NodeGoPageMapperTest extends EntityMapperTestBase {

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
   * Test go_page node mapping.
   */
  public function testGoPageMapping(): void {
    $this->storageProphecy->loadByProperties([
      'uuid' => '123',
    ])->willReturn([$this->entityProphecy]);

    $this->storageProphecy->create([
      'type' => 'go_page',
      'uuid' => '123',
    ])->willReturn($this->entityProphecy);

    $manager = $this->prophesize(BnfMapperManager::class);

    $manager->mapAll([])
      ->willReturn([]);

    $mapper = new NodeGoPageMapper(
      [],
      '',
      [],
      $manager->reveal(),
      $this->entityManagerProphecy->reveal(),
      $this->fileSystemProphecy->reveal(),
      $this->fileRepositoryProphecy->reveal(),
      $this->translationProphecy->reveal(),
      $this->loggerProphecy->reveal(),
    );

    $graphql = NodeGoPage::make(
      id: '123',
      title: 'this is the title',
      url: '/anbefalinger-til-mork-tid',
      status: TRUE,
      changed: ChangedDateTime::make(timestamp: 1735689661, timezone: 'UTC'),
      created: CreatedDateTime::make(timestamp: 1735689661, timezone: 'UTC'),
      publicationDate: PublicationDateDateTime::make(timestamp: 1735689661, timezone: 'UTC'),
    );

    $node = $mapper->map($graphql);

    $this->assertSame($node, $this->entityProphecy->reveal());
    $this->entityProphecy->set('status', Node::PUBLISHED)->shouldHaveBeenCalled();
    $this->entityProphecy->set('title', 'this is the title')->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_publication_date', ["value" => "2025-01-01"])->shouldHaveBeenCalled();

  }

}
