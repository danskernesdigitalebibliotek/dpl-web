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
   * {@inheritdoc}
   */
  public function tearDown(): void {
    putenv('LAGOON_ENVIRONMENT_TYPE');
  }

  /**
   * Test that cookie domain is properly set for www sites.
   */
  public function testWwwCookieDomain(): void {
    $provider = new DplGoServiceProvider();
    $container = $this->cookieTestContainer();
    putenv('LAGOON_ROUTE=https://www.gotest.local');

    $provider->configureCookieDomain($container->reveal());

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

    $provider->configureCookieDomain($container->reveal());

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

  /**
   * Test that CORS is properly configured for non-www. domains.
   */
  public function testCorsConfigurationForNonWwwDomains(): void {
    $provider = new DplGoServiceProvider();
    $container = $this->prophesize(ContainerBuilder::class);
    $container->getParameter('cors.config')->willReturn([
      'enabled' => FALSE,
      'allowedHeaders' => [],
      'allowedOrigins' => ['*'],
    ]);

    putenv('LAGOON_ROUTE=https://gotest.local');

    $provider->configureCors($container->reveal());

    $container->setParameter('cors.config', [
      'enabled' => TRUE,
      'allowedHeaders' => [],
      'allowedOrigins' => ['https://go.gotest.local'],
    ]
    )->shouldHaveBeenCalled();
  }

  /**
   * Test that CORS is properly configured for www. domains.
   */
  public function testCorsConfigurationForWwwDomains(): void {
    $provider = new DplGoServiceProvider();
    $container = $this->prophesize(ContainerBuilder::class);
    $container->getParameter('cors.config')->willReturn([
      'enabled' => FALSE,
      'allowedHeaders' => [],
      'allowedOrigins' => ['*'],
    ]);

    putenv('LAGOON_ROUTE=https://www.gotest.local');

    $provider->configureCors($container->reveal());

    $container->setParameter('cors.config', [
      'enabled' => TRUE,
      'allowedHeaders' => [],
      'allowedOrigins' => ['https://www.go.gotest.local'],
    ]
    )->shouldHaveBeenCalled();
  }

  /**
   * Test that CORS is properly configured locally.
   */
  public function testCorsConfigurationForLocal(): void {
    $provider = new DplGoServiceProvider();
    $container = $this->prophesize(ContainerBuilder::class);
    $container->getParameter('cors.config')->willReturn([
      'enabled' => FALSE,
      'allowedHeaders' => [],
      'allowedOrigins' => ['*'],
    ]);

    putenv('LAGOON_ENVIRONMENT_TYPE=local');
    putenv('LAGOON_ROUTE=https://www.gotest.local');

    $provider->configureCors($container->reveal());

    $container->setParameter('cors.config', [
      'enabled' => TRUE,
      'allowedHeaders' => [],
      'allowedOrigins' => ['*'],
    ]
    )->shouldHaveBeenCalled();
  }

}
