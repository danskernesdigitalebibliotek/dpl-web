<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeArticle;
use Drupal\bnf\Plugin\bnf_mapper\NodeArticleMapper;
use Drupal\node\Entity\Node;

/**
 * Test the article node mapper.
 */
class NodeArticleTestMapper extends EntityMapperTestBase {

  const ENTITY_NAME = 'node';
  const ENTITY_CLASS = Node::class;

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
    );

    $graphqlArticle = NodeArticle::make('123', 'this is the title');

    $node = $mapper->map($graphqlArticle);

    $this->assertSame($node, $this->entityProphecy->reveal());
    $this->entityProphecy->set('title', 'this is the title')->shouldHaveBeenCalled();
  }

}
