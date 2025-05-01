<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_go\Unit;

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
   * {@inheritdoc}
   */
  public function setUp(): void {
    parent::setUp();

    $this->routeResolver = $this->prophesize(LagoonRouteResolver::class);
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
    $goSite = new GoSite($this->routeResolver->reveal());

    putenv('GO_DOMAIN=https://gotest.local');

    $this->assertEquals('https://gotest.local', $goSite->getGoBaseUrl());
  }

  /**
   * Test that for x.domain, the go domain is go.x.domain.
   */
  public function testRegularGoDomain(): void {
    $this->routeResolver->getMainRoute()->willReturn('https://dpl.local');

    $goSite = new GoSite($this->routeResolver->reveal());

    $this->assertEquals('https://go.dpl.local', $goSite->getGoBaseUrl());

  }

}
