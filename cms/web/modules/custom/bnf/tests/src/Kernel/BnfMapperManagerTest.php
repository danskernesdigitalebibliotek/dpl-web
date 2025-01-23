<?php

declare(strict_types=1);

namespace Drupal\Tests\bnf\Kernel;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Site\Settings;
use Drupal\KernelTests\KernelTestBase;
use Drupal\bnf\GraphQL\Operations\GetNode;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeArticle;
use Drupal\node\Entity\Node;
use Drupal\node\NodeInterface;
use Spawnia\Sailor\Testing\UsesSailorMocks;
use Prophecy\Argument;

class BnfMapperManagerTest extends KernelTestBase {

  use UsesSailorMocks;

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'bnf',
    'node',
    'user',
    // Needed for the bnf_state base field.
    'options',
  ];

  public function setUp(): void {
    parent::setUp();
  }

  public function testBnfArticleMapper(): void {
    $manager = $this->container->get('plugin.manager.bnf_mapper');

    $entityManagerProphecy = $this->prophesize(EntityTypeManagerInterface::class);
    $nodeStorageProphecy = $this->prophesize(EntityStorageInterface::class);
    $nodeProphecy = $this->prophesize(Node::class);

    $entityManagerProphecy->getStorage('node')->willReturn($nodeStorageProphecy);
    $nodeStorageProphecy->create([
      'type' => 'article',
      'uuid' => '982e0d87-f6b8-4b84-8de8-c8c8bcfef557',
    ])->willReturn($nodeProphecy);

    $this->container->set('entity_type.manager', $entityManagerProphecy->reveal());

    $graphqlNode = NodeArticle::make('982e0d87-f6b8-4b84-8de8-c8c8bcfef557', 'Bibliotekarerne anbefaler læsning til den mørke tid');


    $mapper = $manager->getMapper($graphqlNode);
    $node = $mapper->map($graphqlNode);

    $this->assertSame($node, $nodeProphecy->reveal());
    $nodeProphecy->set('title', 'Bibliotekarerne anbefaler læsning til den mørke tid')->shouldHaveBeenCalled();
  }

}
