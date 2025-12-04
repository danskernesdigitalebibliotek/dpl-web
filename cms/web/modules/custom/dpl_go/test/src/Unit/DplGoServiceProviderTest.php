<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_go\Unit;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\dpl_go\DplGoServiceProvider;
use Drupal\Tests\UnitTestCase;
use Prophecy\Argument;
use Prophecy\Prophecy\ObjectProphecy;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

use function Safe\putenv;

/**
 * Test the Go service provider.
 */
class DplGoServiceProviderTest extends UnitTestCase {

  /**
   * Test that cookie domain is properly set for www sites.
   */
  public function testWwwCookieDomain(): void {
    $provider = new DplGoServiceProvider();
    $container = $this->cookieTestContainer();
    putenv('LAGOON_ROUTE=https://www.gotest.local');

    $provider->fixCookieDomain($container->reveal());

    $container->setParameter("session.storage.options", [
      'unrelated' => 'setting',
      'cookie_domain' => '.gotest.local',
    ])->shouldHaveBeenCalled();
  }

  /**
   * Test that cookie domain isn't set for non-www domains.
   */
  public function testNonWwwCookieDomain(): void {
    $provider = new DplGoServiceProvider();
    $container = $this->cookieTestContainer();
    putenv('LAGOON_ROUTE=https://gotest.local');

    $provider->fixCookieDomain($container->reveal());

    $container->setParameter(Argument::any(), Argument::any())->shouldNotHaveBeenCalled();
  }

  /**
   * Create a container prophecy for cookie tests.
   *
   * @return \Prophecy\Prophecy\ObjectProphecy<\Drupal\Core\DependencyInjection\ContainerBuilder>
   *   Container builder prophecy.
   */
  protected function cookieTestContainer(): ObjectProphecy {
    $parameterBag = $this->prophesize(ParameterBagInterface::class);
    $parameterBag->has(Argument::any())->willReturn(TRUE);
    $container = $this->prophesize(ContainerBuilder::class);
    $container->getParameterBag()->willReturn($parameterBag);
    $container->getParameter('session.storage.options')->willReturn(['unrelated' => 'setting']);

    return $container;
  }

}
