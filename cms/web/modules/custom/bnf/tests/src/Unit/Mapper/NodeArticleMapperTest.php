<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeArticle;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\PublicationDate\DateTime;
use Drupal\bnf\Plugin\bnf_mapper\NodeArticleMapper;
use Drupal\node\Entity\Node;

/**
 * Test the article node mapper.
 */
class NodeArticleMapperTest extends EntityMapperTestBase {

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
    $this->storageProphecy->create([
      'type' => 'article',
      'uuid' => '123',
    ])->willReturn($this->entityProphecy);

    $manager = $this->prophesize(BnfMapperManager::class);

    $mapper = new NodeArticleMapper(
      [],
      '',
      [],
      $manager->reveal(),
      $this->entityManagerProphecy->reveal(),
      $this->fileSystemProphecy->reveal(),
      $this->fileRepositoryProphecy->reveal(),
    );

    $graphqlArticle = NodeArticle::make(
      '123', 'this is the title', 'https://example.com', DateTime::make(1735689661, 'UTC'), 'this is the subtitle', TRUE, 'this is an author', 'this is a teaser text'
    );

    $node = $mapper->map($graphqlArticle);

    $this->assertSame($node, $this->entityProphecy->reveal());
    $this->entityProphecy->set('title', 'this is the title')->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_subtitle', 'this is the subtitle')->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_override_author', 'this is an author')->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_show_override_author', TRUE)->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_publication_date', ["value" => "2025-01-01"])->shouldHaveBeenCalled();
    $this->entityProphecy->set('field_teaser_text', 'this is a teaser text')->shouldHaveBeenCalled();
  }

}
