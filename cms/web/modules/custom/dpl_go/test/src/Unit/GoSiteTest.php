<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_go\Unit;

use Drupal\Core\Session\AccountInterface;
use Drupal\dpl_go\GoSite;
use Drupal\dpl_lagoon\Services\LagoonRouteResolver;
use Drupal\Tests\UnitTestCase;
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
    $this->goSite = new GoSite($this->routeResolver->reveal(), $this->currentUser->reveal());
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

  public function testGoSiteDetection(): void {
    $this->currentUser->hasPermission('rewrite go urls')->willReturn(TRUE);

    $this->assertTrue($this->goSite->isGoSite());

    $this->currentUser->hasPermission('rewrite go urls')->willReturn(FALSE);

    $this->assertFalse($this->goSite->isGoSite());
  }

  /**
   * Test that we can get the CMS URL too.
   */
  public function testGetCmsDomain(): void {
    $this->routeResolver->getMainRoute()->willReturn('https://dpl.local');

    $this->assertEquals('https://dpl.local', $this->goSite->getCmsBaseUrl());
  }

}
