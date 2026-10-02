<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_react\Unit;

use Drupal\dpl_library_token\LibraryTokenHandler;
use Drupal\dpl_login\AccessToken;
use Drupal\dpl_login\AccessTokenType;
use Drupal\dpl_login\UserTokens;
use Drupal\dpl_react\Controller\DplReactController;
use Drupal\Tests\UnitTestCase;

/**
 * Test which tokens the React apps are handed.
 *
 * @covers \Drupal\dpl_react\Controller\DplReactController
 */
class DplReactControllerTest extends UnitTestCase {

  /**
   * Only patron tokens reach the React apps.
   *
   * @dataProvider provideTokenTypes
   */
  public function testUserTokens(AccessTokenType $type, ?string $expected_line): void {
    $library_token_handler = $this->prophesize(LibraryTokenHandler::class);
    $library_token_handler->getToken()->willReturn((object) ['token' => 'library-token']);

    $access_token = new AccessToken();
    $access_token->token = 'user-token';
    $access_token->expire = 9999;
    $access_token->type = $type;
    $user_tokens = $this->prophesize(UserTokens::class);
    $user_tokens->getCurrent()->willReturn($access_token);

    $controller = new DplReactController($library_token_handler->reveal(), $user_tokens->reveal());
    $content = (string) $controller->user()->getContent();

    $this->assertStringContainsString('window.dplReact.setToken("library", "library-token")', $content);
    if ($expected_line) {
      $this->assertStringContainsString($expected_line, $content);
    }
    else {
      $this->assertStringNotContainsString('user-token', $content);
    }
  }

  /**
   * A Unilogin student's uni-id is handed to the React apps, never the token.
   *
   * The header shows it, so the student can see who is logged in.
   */
  public function testUniloginUserId(): void {
    $library_token_handler = $this->prophesize(LibraryTokenHandler::class);
    $library_token_handler->getToken()->willReturn((object) ['token' => 'library-token']);

    $access_token = new AccessToken();
    $access_token->token = 'user-token';
    $access_token->expire = 9999;
    $access_token->type = AccessTokenType::UniloginUser;
    $access_token->uniId = 'elev4821';
    $user_tokens = $this->prophesize(UserTokens::class);
    $user_tokens->getCurrent()->willReturn($access_token);

    $controller = new DplReactController($library_token_handler->reveal(), $user_tokens->reveal());
    $content = (string) $controller->user()->getContent();

    $this->assertStringContainsString('window.dplReact.setUniloginUserId("elev4821")', $content);
    $this->assertStringNotContainsString('user-token', $content);
  }

  /**
   * Test cases for testUserTokens.
   *
   * @return array<string, array{AccessTokenType, ?string}>
   *   Token type and the line expected for it, if any.
   */
  public static function provideTokenTypes(): array {
    return [
      'Patron' => [AccessTokenType::User, 'window.dplReact.setToken("user", "user-token")'],
      'Unregistered patron' => [
        AccessTokenType::UnregisteredUser,
        'window.dplReact.setToken("unregistered-user", "user-token")',
      ],
      'Unilogin user' => [AccessTokenType::UniloginUser, NULL],
      'Unknown' => [AccessTokenType::Unknown, NULL],
    ];
  }

}
