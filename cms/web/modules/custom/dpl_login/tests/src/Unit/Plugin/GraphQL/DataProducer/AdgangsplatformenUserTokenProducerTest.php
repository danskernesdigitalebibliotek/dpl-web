<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_login\Unit\Plugin\GraphQL\DataProducer;

use Drupal\dpl_login\AccessToken;
use Drupal\dpl_login\AccessTokenType;
use Drupal\dpl_login\Plugin\GraphQL\DataProducer\AdgangsplatformenUserTokenProducer;
use Drupal\dpl_login\UserTokens;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\Tests\UnitTestCase;

/**
 * Test the user token exposed to GO.
 *
 * @covers \Drupal\dpl_login\Plugin\GraphQL\DataProducer\AdgangsplatformenUserTokenProducer
 */
class AdgangsplatformenUserTokenProducerTest extends UnitTestCase {

  /**
   * Create the producer with the given current token.
   */
  protected function createProducer(?AccessToken $token): AdgangsplatformenUserTokenProducer {
    $user_tokens = $this->prophesize(UserTokens::class);
    $user_tokens->getCurrent()->willReturn($token);

    return new AdgangsplatformenUserTokenProducer([], 'adgangsplatformen_user_token_producer', [], $user_tokens->reveal());
  }

  /**
   * The token type is exposed, so GO can tell Unilogin users from patrons.
   *
   * @dataProvider provideTokenTypes
   */
  public function testTokenTypeIsExposed(AccessTokenType $type, string $expected): void {
    $token = new AccessToken();
    $token->token = 'some-token';
    $token->expire = 1759833431;
    $token->type = $type;

    $result = $this->createProducer($token)->resolve($this->prophesize(FieldContext::class)->reveal());

    $this->assertNotNull($result);
    $this->assertSame('some-token', $result['token']);
    $this->assertSame(1759833431, $result['expire']['timestamp']);
    $this->assertSame($expected, $result['type']);
  }

  /**
   * Test cases for testTokenTypeIsExposed.
   *
   * @return array<string, array{AccessTokenType, string}>
   *   Token type and the exposed value.
   */
  public static function provideTokenTypes(): array {
    return [
      'Patron' => [AccessTokenType::User, 'user'],
      'Unregistered patron' => [AccessTokenType::UnregisteredUser, 'unregistered_user'],
      'Unilogin user' => [AccessTokenType::UniloginUser, 'unilogin_user'],
    ];
  }

  /**
   * Without a token nothing is exposed.
   */
  public function testNoToken(): void {
    $this->assertNull($this->createProducer(NULL)->resolve($this->prophesize(FieldContext::class)->reveal()));
  }

}
