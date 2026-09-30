<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_go\Unit\Plugin\GraphQL\DataProducer;

use Drupal\Core\Routing\UrlGeneratorInterface;
use Drupal\dpl_go\Plugin\GraphQL\DataProducer\AdgangsplatformenLoginUrlProducer;
use Drupal\dpl_go\Plugin\GraphQL\DataProducer\UniloginLoginUrlProducer;
use Drupal\Tests\UnitTestCase;

/**
 * Test the GO login urls.
 *
 * @covers \Drupal\dpl_go\Plugin\GraphQL\DataProducer\AdgangsplatformenLoginUrlProducer
 * @covers \Drupal\dpl_go\Plugin\GraphQL\DataProducer\UniloginLoginUrlProducer
 */
class UniloginLoginUrlProducerTest extends UnitTestCase {

  /**
   * Create a url generator that expects a login url with the given query.
   *
   * @param array<string, string> $expected_query
   *   The expected query of the login url.
   */
  protected function createUrlGenerator(array $expected_query): UrlGeneratorInterface {
    $url_generator = $this->prophesize(UrlGeneratorInterface::class);
    $url_generator->generateFromRoute('dpl_go.post_adgangsplatformen_login', [], ['path_processing' => FALSE])
      ->willReturn('/go-login');
    $url_generator->generateFromRoute('dpl_login.login', $expected_query, ['absolute' => TRUE])
      ->willReturn('https://cms.site/login?' . http_build_query($expected_query));

    return $url_generator->reveal();
  }

  /**
   * The Adgangsplatformen login lands on the GO login route.
   */
  public function testAdgangsplatformenLoginUrl(): void {
    $producer = new AdgangsplatformenLoginUrlProducer([], 'go_adgangsplatformen_login_url', [], $this->createUrlGenerator([
      'current-path' => '/go-login',
    ]));

    $this->assertSame('https://cms.site/login?current-path=%2Fgo-login', $producer->resolve());
  }

  /**
   * The Unilogin login forces Unilogin and lands on the same GO login route.
   */
  public function testUniloginLoginUrl(): void {
    $producer = new UniloginLoginUrlProducer([], 'go_unilogin_login_url', [], $this->createUrlGenerator([
      'current-path' => '/go-login',
      'idp' => 'unilogin',
    ]));

    $this->assertSame('https://cms.site/login?current-path=%2Fgo-login&idp=unilogin', $producer->resolve());
  }

}
