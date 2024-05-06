<?php

namespace Drupal\Tests\dpl_login\Unit;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\GeneratedUrl;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Routing\UrlGenerator;
use Drupal\Core\Utility\UnroutedUrlAssemblerInterface;
use Drupal\dpl_login\AccessToken;
use Drupal\dpl_login\AccessTokenType;
use Drupal\dpl_login\Adgangsplatformen\Config;
use Drupal\dpl_login\Controller\DplLoginController;
use Drupal\dpl_login\Exception\MissingConfigurationException;
use Drupal\dpl_login\RegisteredUserTokensProvider;
use Drupal\dpl_login\UnregisteredUserTokensProvider;
use Drupal\dpl_login\UserTokens;
use Drupal\openid_connect\OpenIDConnectClaims;
use Drupal\openid_connect\Plugin\OpenIDConnectClientBase;
use Drupal\Tests\UnitTestCase;
use phpmock\Mock;
use phpmock\MockBuilder;
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

    $builder = new MockBuilder();
    $builder->setNamespace('Drupal\dpl_login\Controller')
      ->setName("user_logout")
      ->setFunction(fn() => NULL)
      ->build()
      ->enable();

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
    $fake_registered_user_token->type = AccessTokenType::USER;

    $fake_unregistered_user_token = clone $fake_access_token;
    $fake_unregistered_user_token->type = AccessTokenType::UNREGISTERED_USER;

    $user_token_provider = $this->prophesize(RegisteredUserTokensProvider::class);
    $user_token_provider->getAccessToken()->willReturn($fake_registered_user_token);

    $unregistered_user_token_provider = $this->prophesize(UnregisteredUserTokensProvider::class);
    $unregistered_user_token_provider->getAccessToken()->willReturn($fake_unregistered_user_token);

    $registered_user_token_provider = $this->prophesize(RegisteredUserTokensProvider::class);
    $registered_user_token_provider->getAccessToken()->willReturn($fake_registered_user_token);

    $user_tokens = $this->prophesize(UserTokens::class);
    $user_tokens->getCurrent()->willReturn($fake_unregistered_user_token);

    $config_factory = $this->prophesize(ConfigFactoryInterface::class);
    $config = $this->prophesize(ImmutableConfig::class);
    $config_factory = $this->prophesize(ConfigFactoryInterface::class);
    $config_factory->get(Config::CONFIG_KEY)->willReturn($config->reveal());

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

    $container = new ContainerBuilder();
    $container->set('logger.factory', $logger_factory->reveal());
    $container->set('dpl_login.user_tokens', $user_tokens->reveal());
    $container->set('dpl_login.unregistered_user_tokens', $registered_user_token_provider->reveal());
    $container->set('dpl_login.unregistered_user_tokens', $unregistered_user_token_provider->reveal());
    $container->set('config.factory', $config_factory->reveal());
    $container->set('unrouted_url_assembler', $unrouted_url_assembler->reveal());
    $container->set('url_generator', $url_generator->reveal());
    $container->set('openid_connect.claims', $openid_connect_claims->reveal());
    $container->set('dpl_login.adgangsplatformen.config', new Config($config_factory->reveal()));
    $container->set('dpl_login.adgangsplatformen.client', $openid_connect_client->reveal());

    \Drupal::setContainer($container);
  }

  /**
   * Make sure an config missing exception is thrown.
   */
  public function testThatExceptionIsThrownIfLogoutEndpointIsMissing(): void {
    $container = \Drupal::getContainer();
    $controller = DplLoginController::create($container);
    $this->expectException(MissingConfigurationException::class);
    $this->expectExceptionMessage('Adgangsplatformen plugin config variable logout_endpoint is missing');
    $controller->logout($this->prophesize(Request::class)->reveal());
  }

  /**
   * The user is redirected to external login when logging out.
   */
  public function testThatExternalRedirectIsActivatedWhenLoggingOut(): void {
    $this->markTestSkipped('After logout is handling current-path, this test has to be updated.');

    $config = $this->prophesize(ImmutableConfig::class);
    $config->get('settings')->willReturn([
      'logout_endpoint' => 'https://valid.uri',
    ])->shouldBeCalledTimes(1);
    $config_factory = $this->prophesize(ConfigFactoryInterface::class);
    $config_factory->get(Config::CONFIG_KEY)->willReturn($config->reveal());

    $container = \Drupal::getContainer();
    $container->set('dpl_login.adgangsplatformen.config', new Config($config_factory->reveal()));
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
   * Test that normal Drupal users (admins get logged out.
   */
  public function testThatAdminsGetLoggedOut(): void {
    $config = $this->prophesize(ImmutableConfig::class);
    $config->get('settings')->willReturn([
      'logout_endpoint' => 'https://valid.uri',
    ])->shouldBeCalledTimes(1);
    $config_factory = $this->prophesize(ConfigFactoryInterface::class);
    $config_factory->get(Config::CONFIG_KEY)->willReturn($config->reveal());
    $user_tokens = $this->prophesize(UserTokens::class);
    $user_tokens->getCurrent()->willReturn(NULL);
    $registered_user_token_provider = $this->prophesize(RegisteredUserTokensProvider::class);
    $registered_user_token_provider->getAccessToken()->willReturn(NULL);
    $unregistered_user_token_provider = $this->prophesize(UnregisteredUserTokensProvider::class);
    $unregistered_user_token_provider->getAccessToken()->willReturn(NULL);
    $url_generator = $this->prophesize(UrlGenerator::class);
    $url_generator->generateFromRoute('<front>', Argument::cetera())->willReturn('https://local.site');

    $container = \Drupal::getContainer();
    $container->set('dpl_login.adgangsplatformen.config', new Config($config_factory->reveal()));
    $container->set('dpl_login.user_tokens', $user_tokens->reveal());
    $container->set('dpl_login.registered_user_tokens', $registered_user_token_provider->reveal());
    $container->set('dpl_login.unregistered_user_tokens', $unregistered_user_token_provider->reveal());
    $container->set('url_generator', $url_generator->reveal());
    \Drupal::setContainer($container);

    $controller = DplLoginController::create($container);
    $response = $response = $controller->logout($this->prophesize(Request::class)->reveal());

    $this->assertInstanceOf(RedirectResponse::class, $response);
    $this->assertSame(
      'https://local.site',
      $response->headers->get('location')
    );
  }

  /**
   * {@inheritDoc}
   */
  public function tearDown(): void {
    Mock::disableAll();
  }

}
