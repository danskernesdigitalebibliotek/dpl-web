<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Unit\Mapper;

use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeArticle as GraphQLArticle;
use Drupal\bnf\Plugin\bnf_mapper\NodeArticle;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\node\Entity\Node;
use Drupal\Tests\UnitTestCase;

/**
 * Test the article node mapper.
 */
class NodeArticleTest extends UnitTestCase {

  /**
   * Test article node mapping.
   */
  public function testNodeArticleMapping(): void {
    $entityManagerProphecy = $this->prophesize(EntityTypeManagerInterface::class);
    $nodeStorageProphecy = $this->prophesize(EntityStorageInterface::class);
    $entityManagerProphecy->getStorage('node')->willReturn($nodeStorageProphecy);
    $nodeProphecy = $this->prophesize(Node::class);

    $nodeStorageProphecy->create([
      'type' => 'article',
      'uuid' => '123',
    ])->willReturn($nodeProphecy);

    $mapper = new NodeArticle([], '', [], $entityManagerProphecy->reveal());

    $graphqlArticle =    GraphQLArticle::make('123', 'this is the title');

    $node = $mapper->map($graphqlArticle);

    $this->assertSame($node, $nodeProphecy->reveal());
    $nodeProphecy->set('title', 'this is the title')->shouldHaveBeenCalled();
  }

}
