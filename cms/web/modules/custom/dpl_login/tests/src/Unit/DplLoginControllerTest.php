<?php

namespace Drupal\Tests\dpl_login\Unit;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ConfigManagerInterface;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\GeneratedUrl;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Routing\LocalRedirectResponse;
use Drupal\Core\Routing\RequestContext;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Routing\UrlGenerator;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\Utility\UnroutedUrlAssemblerInterface;
use Drupal\dpl_login\AccessToken;
use Drupal\dpl_login\AccessTokenType;
use Drupal\dpl_login\Adgangsplatformen\Config;
use Drupal\dpl_login\Controller\DplLoginController;
use Drupal\dpl_login\DplLoginSession;
use Drupal\dpl_login\Exception\MissingConfigurationException;
use Drupal\dpl_login\RegisteredUserTokensProvider;
use Drupal\dpl_login\User;
use Drupal\dpl_login\UnregisteredUserTokensProvider;
use Drupal\dpl_login\UserTokens;
use Drupal\openid_connect\OpenIDConnectClaims;
use Drupal\openid_connect\OpenIDConnectClientEntityInterface;
use Drupal\openid_connect\OpenIDConnectSession;
use Drupal\openid_connect\OpenIDConnectSessionInterface;
use Drupal\openid_connect\Plugin\OpenIDConnectClientBase;
use Drupal\openid_connect\Plugin\OpenIDConnectClientInterface;
use Drupal\Tests\UnitTestCase;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Unit tests for the Library Token Handler.
 */
class DplLoginControllerTest extends UnitTestCase {

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $logger = $this->prophesize(LoggerInterface::class);
    $logger->error(Argument::any(), Argument::any())->shouldNotBeCalled();
    $logger_factory = $this->prophesize(LoggerChannelFactoryInterface::class);
    $logger_factory->get(Argument::any())->willReturn($logger->reveal());

    $fake_access_token = AccessToken::createFromOpenidConnectContext([
      'tokens' => [
        'access_token' => 'dasjhsadhadsjkhkajsdhkj',
        'expire' => 9999,
      ],
    ]);
    $fake_registered_user_token = clone $fake_access_token;
    $fake_registered_user_token->type = AccessTokenType::User;

    $fake_unregistered_user_token = clone $fake_access_token;
    $fake_unregistered_user_token->type = AccessTokenType::UnregisteredUser;

    $user_token_provider = $this->prophesize(RegisteredUserTokensProvider::class);
    $user_token_provider->getAccessToken()->willReturn($fake_registered_user_token);

    $unregistered_user_token_provider = $this->prophesize(UnregisteredUserTokensProvider::class);
    $unregistered_user_token_provider->getAccessToken()->willReturn($fake_unregistered_user_token);

    $registered_user_token_provider = $this->prophesize(RegisteredUserTokensProvider::class);
    $registered_user_token_provider->getAccessToken()->willReturn($fake_registered_user_token);

    $user_tokens = $this->prophesize(UserTokens::class);
    $user_tokens->getCurrent()->willReturn($fake_unregistered_user_token);

    $config = $this->prophesize(ImmutableConfig::class);
    $config_factory = $this->prophesize(ConfigFactoryInterface::class);
    $config_factory->get(Config::CONFIG_KEY)->willReturn($config->reveal());
    $config_manager = $this->prophesize(ConfigManagerInterface::class);
    $config_manager->getConfigFactory()->willReturn($config_factory->reveal());

    $unrouted_url_assembler = $this->prophesize(UnroutedUrlAssemblerInterface::class);
    $generated_url = $this->prophesize(GeneratedUrl::class);
    $generated_url->getGeneratedUrl()->willReturn('https://local.site');
    $url_generator = $this->prophesize(UrlGenerator::class);
    $url_generator->generateFromRoute('<front>', Argument::cetera())->willReturn($generated_url);

    $redirect_response = $this->prophesize(Response::class);
    $openid_connect_client = $this->prophesize(OpenIDConnectClientBase::class);
    $openid_connect_client->authorize()->willReturn($redirect_response);

    $openid_connect_claims = $this->prophesize(OpenIDConnectClaims::class);
    $openid_connect_claims->getScopes()->willReturn('some scopes');

    $openid_connect_session = $this->prophesize(OpenIDConnectSession::class);
    $entity_type_manager = $this->prophesize(EntityTypeManagerInterface::class);
    $openid_connect_client_storage = $this->prophesize(EntityStorageInterface::class);
    $entity_type_manager->getStorage('openid_connect_client')->willReturn($openid_connect_client_storage);

    $user_service = $this->prophesize(User::class);

    $dpl_login_session = $this->prophesize(DplLoginSession::class);

    $container = new ContainerBuilder();
    $container->set('logger.factory', $logger_factory->reveal());
    $container->set('dpl_login.user_tokens', $user_tokens->reveal());
    $container->setAlias(UserTokens::class, 'dpl_login.user_tokens');
    $container->set('dpl_login.unregistered_user_tokens', $registered_user_token_provider->reveal());
    $container->set('dpl_login.unregistered_user_tokens', $unregistered_user_token_provider->reveal());
    $container->set('config.manager', $config_manager->reveal());
    $container->set('unrouted_url_assembler', $unrouted_url_assembler->reveal());
    $container->set('url_generator', $url_generator->reveal());
    $container->set('openid_connect.claims', $openid_connect_claims->reveal());
    $container->setAlias(OpenIDConnectClaims::class, 'openid_connect.claims');
    $container->set('openid_connect.session', $openid_connect_session->reveal());
    $container->setAlias(OpenIDConnectSessionInterface::class, 'openid_connect.session');
    $container->set('dpl_login.adgangsplatformen.config', new Config($config_manager->reveal()));
    $container->set('dpl_login.adgangsplatformen.client', $openid_connect_client->reveal());
    $container->set('entity_type.manager', $entity_type_manager->reveal());
    $container->set('dpl_login.user', $user_service->reveal());
    $container->setAlias(User::class, 'dpl_login.user');
    $container->set('dpl_login.session', $dpl_login_session->reveal());
    $container->setAlias(DplLoginSession::class, 'dpl_login.session');
    \Drupal::setContainer($container);
  }

  /**
   * Make sure a config missing exception is thrown.
   */
  public function testThatExceptionIsThrownIfLogoutEndpointIsMissing(): void {
    $container = \Drupal::getContainer();
    $container->set('dpl_login.adgangsplatformen.config', new Config($container->get('config.manager')));
    $container->setAlias(Config::class, 'dpl_login.adgangsplatformen.config');
    $controller = DplLoginController::create($container);
    $this->expectException(MissingConfigurationException::class);
    $this->expectExceptionMessage('Adgangsplatformen plugin config variable logout_endpoint is missing');
    $controller->logout($this->prophesize(Request::class)->reveal());
  }

  /**
   * The user is redirected to external login when logging out.
   */
  public function testThatExternalRedirectIsActivatedWhenLoggingOut(): void {
    // @todo This test is skipped after the current-path functionality was
    // added to DplLoginController:logout(), we need to mock more services.
    $this->markTestSkipped('After logout is handling current-path, this test has to be updated.');

    $config = $this->prophesize(ImmutableConfig::class);
    $config->get('settings')->willReturn([
      'logout_endpoint' => 'https://valid.uri',
    ])->shouldBeCalledTimes(1);
    $config_factory = $this->prophesize(ConfigFactoryInterface::class);
    $config_factory->get(Config::CONFIG_KEY)->willReturn($config->reveal());
    $config_manager = $this->prophesize(ConfigManagerInterface::class);
    $config_manager->getConfigFactory()->willReturn($config_factory->reveal());

    $container = \Drupal::getContainer();
    $container->set('dpl_login.adgangsplatformen.config', new Config($config_manager->reveal()));
    \Drupal::setContainer($container);

    $controller = DplLoginController::create($container);
    $response = $controller->logout($this->prophesize(Request::class)->reveal());

    $this->assertInstanceOf(TrustedRedirectResponse::class, $response);
    $this->assertSame(
      'https://valid.uri?singlelogout=true&access_token=dasjhsadhadsjkhkajsdhkj&redirect_uri=https%3A//local.site',
      $response->headers->get('location')
    );
  }

  /**
   * Test that normal Drupal users (admins) get logged out.
   */
  public function testThatAdminsGetLoggedOut(): void {
    $config = $this->prophesize(ImmutableConfig::class);
    $config->get('settings')->willReturn([
      'logout_endpoint' => 'https://valid.uri',
    ])->shouldBeCalledTimes(1);
    $config_factory = $this->prophesize(ConfigFactoryInterface::class);
    $config_factory->get(Config::CONFIG_KEY)->willReturn($config->reveal());
    $config_manager = $this->prophesize(ConfigManagerInterface::class);
    $config_manager->getConfigFactory()->willReturn($config_factory->reveal());
    $user_tokens = $this->prophesize(UserTokens::class);
    $user_tokens->getCurrent()->willReturn(NULL);
    $registered_user_token_provider = $this->prophesize(RegisteredUserTokensProvider::class);
    $registered_user_token_provider->getAccessToken()->willReturn(NULL);
    $unregistered_user_token_provider = $this->prophesize(UnregisteredUserTokensProvider::class);
    $unregistered_user_token_provider->getAccessToken()->willReturn(NULL);
    $url_generator = $this->prophesize(UrlGenerator::class);
    $url_generator->generateFromRoute('<front>', Argument::cetera())->willReturn('https://local.site');

    $container = \Drupal::getContainer();
    $container->set('dpl_login.adgangsplatformen.config', new Config($config_manager->reveal()));
    $container->setAlias(Config::class, 'dpl_login.adgangsplatformen.config');
    $container->set('dpl_login.user_tokens', $user_tokens->reveal());
    $container->set('dpl_login.registered_user_tokens', $registered_user_token_provider->reveal());
    $container->set('dpl_login.unregistered_user_tokens', $unregistered_user_token_provider->reveal());
    $container->set('url_generator', $url_generator->reveal());
    \Drupal::setContainer($container);

    $controller = DplLoginController::create($container);
    $response = $controller->logout($this->prophesize(Request::class)->reveal());

    $this->assertInstanceOf(RedirectResponse::class, $response);
    $this->assertSame(
      'https://local.site',
      $response->headers->get('location')
    );
  }

  /**
   * An allow-listed identity provider is forwarded to Adgangsplatformen.
   *
   * @dataProvider provideIdentityProviders
   */
  public function testThatLoginForwardsAllowListedIdentityProvider(?string $idp, bool $is_unilogin, array $additional_params): void {
    $current_user = $this->prophesize(AccountProxyInterface::class);
    $current_user->isAuthenticated()->willReturn(FALSE);

    $response = new Response();
    $plugin = $this->prophesize(OpenIDConnectClientInterface::class);
    $plugin->authorize('openid', $additional_params)->willReturn($response)->shouldBeCalled();
    $client = $this->prophesize(OpenIDConnectClientEntityInterface::class);
    $client->getPlugin()->willReturn($plugin->reveal());
    $client_storage = $this->prophesize(EntityStorageInterface::class);
    $client_storage->load('adgangsplatformen')->willReturn($client->reveal());
    $entity_type_manager = $this->prophesize(EntityTypeManagerInterface::class);
    $entity_type_manager->getStorage('openid_connect_client')->willReturn($client_storage->reveal());

    $claims = $this->prophesize(OpenIDConnectClaims::class);
    $claims->getScopes($plugin->reveal())->willReturn('openid');

    $dpl_login_session = $this->prophesize(DplLoginSession::class);

    $container = \Drupal::getContainer();
    $container->set('current_user', $current_user->reveal());
    $container->set('entity_type.manager', $entity_type_manager->reveal());
    $container->set('openid_connect.claims', $claims->reveal());
    $container->set('dpl_login.session', $dpl_login_session->reveal());
    $container->setAlias(Config::class, 'dpl_login.adgangsplatformen.config');
    \Drupal::setContainer($container);

    $query = $idp ? ['idp' => $idp] : [];
    $controller = DplLoginController::create($container);
    $this->assertSame($response, $controller->login(new Request($query)));

    $dpl_login_session->setUniloginLogin($is_unilogin)->shouldHaveBeenCalled();
  }

  /**
   * A logged-in user who hits /login is logged out before logging in again.
   *
   * A Unilogin student starting a patron login is also logged out of
   * Adgangsplatformen, and then sent back to /login. Otherwise a cancelled
   * patron login would leave the student logged out of the CMS only.
   *
   * @dataProvider provideLoggedInUsers
   */
  public function testThatLoggedInUsersAreLoggedOutOnLogin(?AccessTokenType $token_type, array $query, ?string $expected_location): void {
    $current_user = $this->prophesize(AccountProxyInterface::class);
    $current_user->isAuthenticated()->willReturn(TRUE);

    $token = NULL;
    if ($token_type) {
      $token = new AccessToken();
      $token->token = 'student-token';
      $token->expire = 9999;
      $token->type = $token_type;
    }
    $user_tokens = $this->prophesize(UserTokens::class);
    $user_tokens->getCurrent()->willReturn($token);

    $config = $this->prophesize(ImmutableConfig::class);
    $config->get('settings')->willReturn(['logout_endpoint' => 'https://login.example/logout']);
    $config_factory = $this->prophesize(ConfigFactoryInterface::class);
    $config_factory->get(Config::CONFIG_KEY)->willReturn($config->reveal());
    $config_manager = $this->prophesize(ConfigManagerInterface::class);
    $config_manager->getConfigFactory()->willReturn($config_factory->reveal());

    $logger = $this->prophesize(LoggerInterface::class);
    $logger_factory = $this->prophesize(LoggerChannelFactoryInterface::class);
    $logger_factory->get(Argument::any())->willReturn($logger->reveal());

    $user_service = $this->prophesize(User::class);

    $container = \Drupal::getContainer();
    $container->set('current_user', $current_user->reveal());
    $container->set('dpl_login.user_tokens', $user_tokens->reveal());
    $container->set('dpl_login.adgangsplatformen.config', new Config($config_manager->reveal()));
    $container->setAlias(Config::class, 'dpl_login.adgangsplatformen.config');
    $container->set('logger.factory', $logger_factory->reveal());
    $container->set('dpl_login.user', $user_service->reveal());
    $request = Request::create('https://library.example/login', 'GET', $query);
    $request_context = new RequestContext();
    $request_context->fromRequest($request);
    $request_context->setCompleteBaseUrl('https://library.example');
    $container->set('router.request_context', $request_context);
    \Drupal::setContainer($container);

    $controller = DplLoginController::create($container);
    $response = $controller->login($request);

    $user_service->logout()->shouldHaveBeenCalled();
    if ($expected_location) {
      $this->assertInstanceOf(TrustedRedirectResponse::class, $response);
      $this->assertSame($expected_location, $response->headers->get('location'));
    }
    else {
      $this->assertInstanceOf(LocalRedirectResponse::class, $response);
      $this->assertSame($request->getUri(), $response->headers->get('location'));
    }
  }

  /**
   * Test cases for testThatLoggedInUsersAreLoggedOutOnLogin.
   *
   * @return array<string, array{?\Drupal\dpl_login\AccessTokenType, array<string, string>, ?string}>
   *   Token type, query and the expected external redirect, if any.
   */
  public static function provideLoggedInUsers(): array {
    return [
      'Unilogin student starting a patron login' => [
        AccessTokenType::UniloginUser,
        ['current-path' => '/work/123'],
        'https://login.example/logout?singlelogout=true&access_token=student-token&redirect_uri=https%3A//library.example/login%3Fcurrent-path%3D%252Fwork%252F123',
      ],
      'Unilogin student starting a Unilogin login' => [
        AccessTokenType::UniloginUser,
        ['current-path' => '/go-login', 'idp' => 'unilogin'],
        NULL,
      ],
      'Patron' => [AccessTokenType::User, ['current-path' => '/work/123'], NULL],
      'Editor without a token' => [NULL, [], NULL],
    ];
  }

  /**
   * Test cases for testThatLoginForwardsAllowListedIdentityProvider.
   *
   * @return array<string, array{?string, bool, array<string, string>}>
   *   The idp query parameter, whether it is a Unilogin login and the
   *   parameters expected to be added to the authorization request.
   */
  public static function provideIdentityProviders(): array {
    return [
      'No identity provider' => [NULL, FALSE, []],
      'Unilogin' => ['unilogin', TRUE, ['idp' => 'unilogin_oidc']],
      'Unknown identity provider' => ['nemlogin', FALSE, []],
    ];
  }

}
