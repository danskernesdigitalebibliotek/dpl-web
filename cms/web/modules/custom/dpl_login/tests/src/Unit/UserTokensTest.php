<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_login\Unit;

use Drupal\Core\TempStore\PrivateTempStore;
use Drupal\Core\TempStore\PrivateTempStoreFactory;
use Drupal\dpl_login\AccessToken;
use Drupal\dpl_login\AccessTokenType;
use Drupal\dpl_login\RegisteredUserTokensProvider;
use Drupal\dpl_login\UniloginUserTokensProvider;
use Drupal\dpl_login\UnregisteredUserTokensProvider;
use Drupal\dpl_login\UserTokens;
use Drupal\Tests\UnitTestCase;

/**
 * Unit tests for the user tokens service.
 *
 * @covers \Drupal\dpl_login\UserTokens
 * @covers \Drupal\dpl_login\UniloginUserTokensProvider
 */
class UserTokensTest extends UnitTestCase {

  /**
   * Temp stores keyed by collection, standing in for the private temp store.
   *
   * @var array<string, \Drupal\Core\TempStore\PrivateTempStore>
   */
  protected array $tempStores = [];

  /**
   * Registered user token provider.
   */
  protected RegisteredUserTokensProvider $registered;

  /**
   * Unregistered user token provider.
   */
  protected UnregisteredUserTokensProvider $unregistered;

  /**
   * Unilogin user token provider.
   */
  protected UniloginUserTokensProvider $unilogin;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $factory = $this->createMock(PrivateTempStoreFactory::class);
    $factory->method('get')->willReturnCallback(function (string $collection) {
      if (!isset($this->tempStores[$collection])) {
        $values = [];
        $store = $this->createMock(PrivateTempStore::class);
        $store->method('set')->willReturnCallback(function (string $key, mixed $value) use (&$values) {
          $values[$key] = $value;
        });
        $store->method('get')->willReturnCallback(function (string $key) use (&$values) {
          return $values[$key] ?? NULL;
        });
        $this->tempStores[$collection] = $store;
      }
      return $this->tempStores[$collection];
    });

    $this->registered = new RegisteredUserTokensProvider($factory);
    $this->unregistered = new UnregisteredUserTokensProvider($factory);
    $this->unilogin = new UniloginUserTokensProvider($factory);
  }

  /**
   * Create a token.
   */
  protected function token(): AccessToken {
    return AccessToken::createFromOpenidConnectContext([
      'tokens' => ['access_token' => 'some-token', 'expire' => 9999],
    ]);
  }

  /**
   * A Unilogin user token is typed as such and returned as the current token.
   */
  public function testUniloginUserTokenIsCurrent(): void {
    $this->unilogin->setAccessToken($this->token());

    $user_tokens = new UserTokens($this->registered, $this->unregistered, $this->unilogin);
    $current = $user_tokens->getCurrent();

    $this->assertNotNull($current);
    $this->assertSame(AccessTokenType::UniloginUser, $current->type);
    $this->assertSame('some-token', $current->token);
  }

  /**
   * The Unilogin provider keeps its token in its own collection.
   */
  public function testUniloginUserTokenIsStoredSeparately(): void {
    $this->unilogin->setAccessToken($this->token());

    $this->assertNull($this->registered->getAccessToken());
    $this->assertNull($this->unregistered->getAccessToken());
    $this->assertArrayHasKey(UniloginUserTokensProvider::class, $this->tempStores);
  }

  /**
   * Without any token there is no current token.
   */
  public function testNoCurrentToken(): void {
    $user_tokens = new UserTokens($this->registered, $this->unregistered, $this->unilogin);
    $this->assertNull($user_tokens->getCurrent());
  }

}
