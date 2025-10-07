<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_login\Unit\EventSubscriber;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\dpl_login\AccessToken;
use Drupal\dpl_login\EventSubscriber\LogoutExpiredTokensSubscriber;
use Drupal\dpl_login\User;
use Drupal\dpl_login\UserTokens;
use Drupal\Tests\UnitTestCase;
use Symfony\Component\HttpKernel\Event\RequestEvent;

/**
 * Test that the subscriber logs out users when token expires.
 */
class LogoutExpiredTokensSubscriberTest extends UnitTestCase {

  const CURRENT_TIMESTAMP = 1759833431;
  const VALID_TIMESTAMP = 1759833441;
  const EXPIRED_TIMESTAMP = 1759833421;

  /**
   * Test that users with expired tokens are logged out.
   *
   * @dataProvider provideTokenCases
   */
  public function testLogoutExpired(
    bool $isAuthenticated,
    ?int $expire,
    bool $shouldBeLoggedOut,
  ): void {
    // Mock a user, possibly authenticated.
    $user = $this->prophesize(AccountInterface::class);
    $user->isAuthenticated()->willReturn($isAuthenticated);

    // Mock the tokens.
    $userTokens = $this->prophesize(UserTokens::class);
    $accessToken = NULL;
    if ($expire) {
      $accessToken = new AccessToken();
      $accessToken->expire = $expire;
    }
    $userTokens->getCurrent()->willReturn($accessToken);

    // Mock the current time.
    $dateTime = $this->prophesize(TimeInterface::class);
    $dateTime->getRequestTime()->willReturn(self::CURRENT_TIMESTAMP);

    // And mock user service.
    $userService = $this->prophesize(User::class);

    $event = $this->prophesize(RequestEvent::class);
    $subscriber = new LogoutExpiredTokensSubscriber(
      $user->reveal(),
      $userTokens->reveal(),
      $dateTime->reveal(),
      $userService->reveal(),
    );

    $subscriber->logoutExpired($event->reveal());

    if ($shouldBeLoggedOut) {
      $userService->logout()->shouldHaveBeenCalled();
    }
    else {
      $userService->logout()->shouldNotHaveBeenCalled();
    }
  }

  /**
   * Test cases for testLogoutExpired.
   *
   * @return array<string, array{bool, ?int, bool}>
   *   Array of test cases
   */
  public function provideTokenCases(): array {
    return [
      'Anonymous user' => [FALSE, NULL, FALSE],
      'Authenticated, tokenless user' => [TRUE, NULL, FALSE],
      'Non-expired token' => [TRUE, self::VALID_TIMESTAMP, FALSE],
      'Expired token' => [TRUE, self::EXPIRED_TIMESTAMP, TRUE],
    ];
  }

}
