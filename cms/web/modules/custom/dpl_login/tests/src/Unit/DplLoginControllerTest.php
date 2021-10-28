<?php

namespace Drupal\Tests\dpl_library_token\Unit;

use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Drupal\Tests\UnitTestCase;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\dpl_login\UserTokensProvider;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\dpl_library_token\LibraryTokenHandler;
use Drupal\dpl_login\Controller\DplLoginController;
use Drupal\Core\PageCache\ResponsePolicy\KillSwitch;
use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\GeneratedUrl;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Routing\UrlGenerator;
use Drupal\Core\Utility\UnroutedUrlAssemblerInterface;
use Drupal\dpl_login\AccessToken;
use Drupal\dpl_login\Exception\MissingConfigurationException;

// Mocking user_logout function.
require_once 'user_logout.mock.php';

/**
 * Unit tests for the Library Token Handler.
 */
class DplLoginControllerTest extends UnitTestCase {

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    $logger = $this->prophesize(LoggerInterface::class);
    $logger->error(Argument::any(), Argument::any())->shouldNotBeCalled();
    $logger_factory = $this->prophesize(LoggerChannelFactoryInterface::class);
    $logger_factory->get(Argument::any())->willReturn($logger->reveal());

    $kill_switch = $this->prophesize(KillSwitch::class);

    $fake_access_token = AccessToken::createFromOpenidConnectContext([
      'tokens' => [
        'access_token' => 'dasjhsadhadsjkhkajsdhkj',
        'expire' => 9999,
      ],
    ]);
    $user_token_provider = $this->prophesize(UserTokensProvider::class);
    $user_token_provider->getAccessToken()->willReturn($fake_access_token);

    $config_factory = $this->prophesize(ConfigFactoryInterface::class);
    $config = $this->prophesize(ImmutableConfig::class);
    $config_factory = $this->prophesize(ConfigFactoryInterface::class);
    $config_factory->get(LibraryTokenHandler::SETTINGS_KEY)->willReturn($config->reveal());

    $unrouted_url_assembler = $this->prophesize(UnroutedUrlAssemblerInterface::class);
    $generated_url = $this->prophesize(GeneratedUrl::class);
    $generated_url->getGeneratedUrl()->willReturn('https://local.site');
    $url_generator = $this->prophesize(UrlGenerator::class);
    $url_generator->generateFromRoute('<front>', Argument::cetera())->willReturn($generated_url);

    $container = new ContainerBuilder();
    $container->set('logger.factory', $logger_factory->reveal());
    $container->set('page_cache_kill_switch', $kill_switch->reveal());
    $container->set('dpl_login.user_tokens', $user_token_provider->reveal());
    $container->set('config.factory', $config_factory->reveal());
    $container->set('unrouted_url_assembler', $unrouted_url_assembler->reveal());
    $container->set('url_generator', $url_generator->reveal());

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
    $controller->logout();
  }

  /**
   * Make sure an config missing exception is NOT thrown.
   */
  public function testThatExceptionIsNotThrownIfLogoutEndpointIsPresent(): void {
    $config = $this->prophesize(ImmutableConfig::class);
    $config->get('settings')->willReturn([
      'logout_endpoint' => 'https://valid.uri',
    ])->shouldBeCalledTimes(1);
    $config_factory = $this->prophesize(ConfigFactoryInterface::class);
    $config_factory->get(LibraryTokenHandler::SETTINGS_KEY)->willReturn($config->reveal());

    $container = \Drupal::getContainer();
    $container->set('config.factory', $config_factory->reveal());
    \Drupal::setContainer($container);

    $controller = DplLoginController::create($container);
    $controller->logout();
  }

}
