<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_go\Unit\Plugin\GraphQL\DataProducer;

use Drupal\Core\GeneratedUrl;
use Drupal\Core\Routing\UrlGeneratorInterface;
use Drupal\dpl_go\Plugin\GraphQL\DataProducer\AdgangsplatformenLoginUrlProducer;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\Tests\UnitTestCase;

/**
 * Test the GO login urls.
 *
 * @covers \Drupal\dpl_go\Plugin\GraphQL\DataProducer\AdgangsplatformenLoginUrlProducer
 */
class AdgangsplatformenLoginUrlProducerTest extends UnitTestCase {

  /**
   * The login url lands on the GO login route, with Unilogin forced if asked.
   *
   * @param string|null $idp
   *   The identity provider to force, if any.
   * @param array<string, string> $expected_query
   *   The expected query of the login url.
   *
   * @dataProvider provideIdentityProviders
   */
  public function testLoginUrl(?string $idp, array $expected_query): void {
    $login_url = (new GeneratedUrl())->setGeneratedUrl('https://cms.site/login?' . http_build_query($expected_query));

    $url_generator = $this->prophesize(UrlGeneratorInterface::class);
    $url_generator->generateFromRoute('dpl_go.post_adgangsplatformen_login', [], ['path_processing' => FALSE])
      ->willReturn('/go-login');
    $url_generator->generateFromRoute('dpl_login.login', [], ['query' => $expected_query, 'absolute' => TRUE], TRUE)
      ->willReturn($login_url);

    // The url depends on the host it is built on, so its cacheability must
    // follow the field.
    $field_context = $this->prophesize(FieldContext::class);
    $field_context->addCacheableDependency($login_url)->shouldBeCalled();

    $producer = new AdgangsplatformenLoginUrlProducer([], 'go_adgangsplatformen_login_url', [], $url_generator->reveal());

    $this->assertSame($login_url->getGeneratedUrl(), $producer->resolve($idp, $field_context->reveal()));
  }

  /**
   * Test cases for testLoginUrl.
   *
   * @return array<string, array{?string, array<string, string>}>
   *   The identity provider and the expected query of the login url.
   */
  public static function provideIdentityProviders(): array {
    return [
      'Adgangsplatformen' => [NULL, ['current-path' => '/go-login']],
      'Unilogin' => ['unilogin', ['current-path' => '/go-login', 'idp' => 'unilogin']],
    ];
  }

}
