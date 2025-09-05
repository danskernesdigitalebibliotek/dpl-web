<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_go\Unit;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\KeyValueStore\KeyValueStoreInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\dpl_go\GoSite;
use Drupal\dpl_lagoon\Services\LagoonRouteResolver;
use Drupal\Tests\UnitTestCase;
use Prophecy\Argument;
use Prophecy\Prophecy\ObjectProphecy;
use function Safe\putenv;

/**
 * Test the GoSite class.
 */
class GoSiteTest extends UnitTestCase {

  /**
   * Lagoon route resolver mock.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\dpl_lagoon\Services\LagoonRouteResolver>
   */
  protected ObjectProphecy $routeResolver;

  /**
   * Current user mock.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Session\AccountInterface>
   */
  protected ObjectProphecy $currentUser;

  /**
   * Node storage mock.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\EntityStorageInterface>
   */
  protected ObjectProphecy $nodeStorage;

  /**
   * Key-value store mock.
   *
   * @var \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\KeyValueStore\KeyValueStoreInterface>
   */
  protected ObjectProphecy $keyvalue;

  /**
   * Object under test.
   */
  protected GoSite $goSite;

  /**
   * {@inheritdoc}
   */
  public function setUp(): void {
    parent::setUp();

    $this->routeResolver = $this->prophesize(LagoonRouteResolver::class);
    $this->currentUser = $this->prophesize(AccountInterface::class);

    $this->nodeStorage = $this->prophesize(EntityStorageInterface::class);
    $entityTypeManager = $this->prophesize(EntityTypeManagerInterface::class);
    $entityTypeManager->getStorage('node')->willReturn($this->nodeStorage);

    $this->keyvalue = $this->prophesize(KeyValueStoreInterface::class);

    $this->goSite = new GoSite(
      $this->routeResolver->reveal(),
      $this->currentUser->reveal(),
      $entityTypeManager->reveal(),
      $this->keyvalue->reveal(),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function tearDown(): void {
    putenv('GO_DOMAIN');
  }

  /**
   * Test that GO_DOMAIN overrides.
   */
  public function testGoDomainOverrides(): void {
    putenv('GO_DOMAIN=https://gotest.local');

    $this->assertEquals('https://gotest.local', $this->goSite->getGoBaseUrl());
  }

  /**
   * Test that for x.domain, the go domain is go.x.domain.
   */
  public function testRegularGoDomain(): void {
    $this->routeResolver->getMainRoute()->willReturn('https://dpl.local');

    $this->assertEquals('https://go.dpl.local', $this->goSite->getGoBaseUrl());
  }

  /**
   * Test that for www.x.domain, the go domain is www.go.x.domain.
   */
  public function testWwwGoDomain(): void {
    $this->routeResolver->getMainRoute()->willReturn('https://www.dpl.local');

    $this->assertEquals('https://www.go.dpl.local', $this->goSite->getGoBaseUrl());
  }

  /**
   * Test isGoSite.
   */
  public function testGoSiteDetection(): void {
    // Not user 1.
    $this->currentUser->id()->willReturn(12);
    $this->currentUser->hasPermission('use absolute cms urls')->willReturn(TRUE);

    $this->assertTrue($this->goSite->isGoSite());

    $this->currentUser->hasPermission('use absolute cms urls')->willReturn(FALSE);

    $this->assertFalse($this->goSite->isGoSite());

    // Test useAbsoluteUrls method.
    $this->currentUser->hasPermission('use absolute cms and go urls')->willReturn(TRUE);

    $this->assertTrue($this->goSite->useAbsoluteUrls());

    $this->currentUser->hasPermission('use absolute cms and go urls')->willReturn(FALSE);

    $this->assertFalse($this->goSite->useAbsoluteUrls());
  }

  /**
   * Test site detection for user 1.
   *
   * Although they get all permissions, they shouldn't get `isGoSite() ===
   * TRUE`.
   */
  public function testSuperUserSiteDetection(): void {
    $this->currentUser->id()->willReturn(1);
    $this->currentUser->hasPermission('use absolute cms urls')->willReturn(TRUE);

    $this->assertFalse($this->goSite->isGoSite());
  }

  /**
   * Test that we can get the CMS URL too.
   */
  public function testGetCmsDomain(): void {
    $this->routeResolver->getMainRoute()->willReturn('https://dpl.local');

    $this->assertEquals('https://dpl.local', $this->goSite->getCmsBaseUrl());
  }

  /**
   * Test isGoNode.
   */
  public function testIsGoNode(): void {
    $node = $this->prophesize(EntityInterface::class);

    $node->bundle()->willReturn('page');
    $this->assertFalse($this->goSite->isGoNode($node->reveal()));

    $node->bundle()->willReturn('go_page');
    $this->assertTrue($this->goSite->isGoNode($node->reveal()));
  }

  /**
   * Test that isGoNid() recognizes go nodes.
   */
  public function testIsGoNidGoNode(): void {
    $this->nodeStorage->load('23')->willReturn($this->nodeProphecy('go_node'));

    $this->keyvalue->get('dpl_go.node_type_cache_0', [])->willReturn([]);
    $this->keyvalue->set('dpl_go.node_type_cache_0', ['23' => TRUE])->shouldBeCalled();

    $this->assertTrue($this->goSite->isGoNid('23'));
  }

  /**
   * Test that isGoNid() recognizes non-go nodes.
   */
  public function testIsGoNidNonGoNode(): void {
    $this->nodeStorage->load('124')->willReturn($this->nodeProphecy('node'));

    $this->keyvalue->get('dpl_go.node_type_cache_1', [])->willReturn([]);
    $this->keyvalue->set('dpl_go.node_type_cache_1', ['124' => FALSE])->shouldBeCalled();

    $this->assertFalse($this->goSite->isGoNid('124'));
  }

  /**
   * Test that isGoNid() uses cache.
   */
  public function testIsGoNidUsesCache(): void {
    $this->nodeStorage->load('125')->willReturn($this->nodeProphecy('node'));

    $this->keyvalue->get('dpl_go.node_type_cache_1', [])->willReturn(['125' => TRUE]);
    $this->keyvalue->set('dpl_go.node_type_cache_1', Argument::any())->shouldNotBeCalled();

    $this->assertTrue($this->goSite->isGoNid('125'));
  }

  /**
   * Test that isGoNid() chunks its cache.
   */
  public function testIsGoNidChunksCache(): void {
    $this->nodeStorage->load('256')->willReturn($this->nodeProphecy('go_node'));

    $this->keyvalue->get('dpl_go.node_type_cache_2', [])->willReturn([]);
    $this->keyvalue->set('dpl_go.node_type_cache_2', ['256' => TRUE])->shouldBeCalled();

    $this->assertTrue($this->goSite->isGoNid('256'));
  }

  /**
   * Test that isGoNid() returns null for non-existent nodes.
   */
  public function testIsGoNidNull(): void {
    $this->keyvalue->get('dpl_go.node_type_cache_2', [])->willReturn([]);
    // As it's the only entry, the state key should be deleted instead.
    $this->keyvalue->delete('dpl_go.node_type_cache_2')->shouldBeCalled();

    $this->assertNull($this->goSite->isGoNid('257'));
  }

  /**
   * Create a node prophecy.
   *
   * @return \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\Entity\EntityInterface>
   *   The node prophecy.
   */
  protected function nodeProphecy(string $type): ObjectProphecy {
    $node = $this->prophesize(EntityInterface::class);
    $node->bundle()->willReturn($type);

    return $node;
  }

}
