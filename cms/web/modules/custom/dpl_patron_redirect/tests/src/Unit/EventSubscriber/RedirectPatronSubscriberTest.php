<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_patron_redirect\Unit\EventSubscriber;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\GeneratedUrl;
use Drupal\Core\PageCache\ResponsePolicy\KillSwitch;
use Drupal\Core\Path\CurrentPathStack;
use Drupal\Core\Path\PathMatcherInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Routing\UrlGeneratorInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\dpl_login\AccessToken;
use Drupal\dpl_login\AccessTokenType;
use Drupal\dpl_login\UserTokens;
use Drupal\dpl_patron_redirect\EventSubscriber\RedirectPatronSubscriber;
use Drupal\openid_connect\OpenIDConnectSession;
use Drupal\path_alias\AliasManagerInterface;
use Drupal\Tests\UnitTestCase;
use Prophecy\Argument;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;

/**
 * Test who is redirected away from patron pages, and where to.
 */
class RedirectPatronSubscriberTest extends UnitTestCase {

  const PATRON_PAGE = '/user/me/loans';

  const OTHER_PAGE = '/search';

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $urlGenerator = $this->prophesize(UrlGeneratorInterface::class);
    $urlGenerator->generateFromRoute(Argument::cetera())->will(
      fn (array $args) => (new GeneratedUrl())->setGeneratedUrl('route:' . $args[0])
    );

    $container = new ContainerBuilder();
    $container->set('url_generator', $urlGenerator->reveal());
    \Drupal::setContainer($container);
  }

  /**
   * Patron pages are only for patrons.
   *
   * Anonymous visitors are sent to login. Unilogin students are logged in to
   * Drupal but are not patrons: sending them to login would log them out and,
   * through single sign-on, straight back in again, so they are sent to the
   * front page instead.
   *
   * @param bool $anonymous
   *   Whether the visitor is anonymous.
   * @param \Drupal\dpl_login\AccessTokenType|null $tokenType
   *   The type of the visitor's user token, if any.
   * @param string $path
   *   The requested path.
   * @param string|null $expectedRedirect
   *   The expected redirect target, or NULL for no redirect.
   *
   * @dataProvider provideVisitors
   */
  public function testCheckAuthStatus(bool $anonymous, ?AccessTokenType $tokenType, string $path, ?string $expectedRedirect): void {
    $account = $this->prophesize(AccountProxyInterface::class);
    $account->isAnonymous()->willReturn($anonymous);
    $account->isAuthenticated()->willReturn(!$anonymous);

    $token = NULL;
    if ($tokenType) {
      $token = new AccessToken();
      $token->type = $tokenType;
    }
    $userTokens = $this->prophesize(UserTokens::class);
    $userTokens->getCurrent()->willReturn($token);
    $userTokens->isUniloginUser()->willReturn($tokenType === AccessTokenType::UniloginUser);

    $config = $this->prophesize(ImmutableConfig::class);
    $config->get('pages')->willReturn('/user/me/*');
    $configFactory = $this->prophesize(ConfigFactoryInterface::class);
    $configFactory->get('dpl_patron_redirect.settings')->willReturn($config->reveal());

    $currentPath = $this->prophesize(CurrentPathStack::class);
    $currentPath->getPath()->willReturn($path);
    $aliasManager = $this->prophesize(AliasManagerInterface::class);
    $aliasManager->getAliasByPath($path)->willReturn($path);
    $pathMatcher = $this->prophesize(PathMatcherInterface::class);
    $pathMatcher->matchPath(Argument::type('string'), '/user/me/*')->will(
      fn (array $args) => str_starts_with($args[0], '/user/me/')
    );

    $session = $this->prophesize(OpenIDConnectSession::class);
    $killSwitch = $this->prophesize(KillSwitch::class);

    $subscriber = new RedirectPatronSubscriber(
      $aliasManager->reveal(),
      $pathMatcher->reveal(),
      $currentPath->reveal(),
      $configFactory->reveal(),
      $account->reveal(),
      $killSwitch->reveal(),
      $session->reveal(),
      $userTokens->reveal(),
    );

    $event = new RequestEvent(
      $this->createMock(HttpKernelInterface::class),
      Request::create($path),
      HttpKernelInterface::MAIN_REQUEST,
    );
    $subscriber->checkAuthStatus($event);

    $response = $event->getResponse();
    if ($expectedRedirect === NULL) {
      $this->assertNull($response);
      return;
    }

    $this->assertInstanceOf(TrustedRedirectResponse::class, $response);
    $this->assertSame($expectedRedirect, $response->getTargetUrl());
  }

  /**
   * Test cases for testCheckAuthStatus.
   *
   * @return array<string, array{bool, ?\Drupal\dpl_login\AccessTokenType, string, ?string}>
   *   Anonymous, token type, path and expected redirect target.
   */
  public static function provideVisitors(): array {
    return [
      'Anonymous visitor on a patron page' => [TRUE, NULL, self::PATRON_PAGE, 'route:dpl_login.login'],
      'Anonymous visitor on another page' => [TRUE, NULL, self::OTHER_PAGE, NULL],
      'Unilogin student on a patron page' => [FALSE, AccessTokenType::UniloginUser, self::PATRON_PAGE, 'route:<front>'],
      'Unilogin student on another page' => [FALSE, AccessTokenType::UniloginUser, self::OTHER_PAGE, NULL],
      'Patron on a patron page' => [FALSE, AccessTokenType::User, self::PATRON_PAGE, NULL],
      'Unregistered patron on a patron page' => [FALSE, AccessTokenType::UnregisteredUser, self::PATRON_PAGE, NULL],
      'Editor without a token on a patron page' => [FALSE, NULL, self::PATRON_PAGE, NULL],
    ];
  }

}
