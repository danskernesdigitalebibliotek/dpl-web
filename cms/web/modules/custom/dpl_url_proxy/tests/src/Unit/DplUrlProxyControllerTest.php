<?php

namespace Drupal\Tests\dpl_library_token\Unit;

use phpmock\MockBuilder;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Drupal\Tests\UnitTestCase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ConfigManagerInterface;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\StringTranslation\TranslationManager;
use Drupal\dpl_url_proxy\Controller\DplUrlProxyController;
use Drupal\dpl_url_proxy\DplUrlProxyInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Unit tests for the Library Token Handler.
 */
class DplUrlProxyControllerTest extends UnitTestCase {

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    // $logger = $this->prophesize(LoggerInterface::class);
    // $logger->error(Argument::any(), Argument::any())->shouldNotBeCalled();
    // $logger_factory = $this->prophesize(LoggerChannelFactoryInterface::class);
    // $logger_factory->get(Argument::any())->willReturn($logger->reveal());

    $config = $this->prophesize(ImmutableConfig::class);
    $config->get('values', [
      'prefix' => '',
      'hostnames' => [],
    ])->willReturn([
      'prefix' => '',
      'hostnames' => [],
    ]);

    $config_factory = $this->prophesize(ConfigFactoryInterface::class);
    $config_factory->get(DplUrlProxyInterface::CONFIG_NAME)->willReturn($config->reveal());

    $config_manager = $this->prophesize(ConfigManagerInterface::class);
    $config_manager->getConfigFactory()->willReturn($config_factory->reveal());

    $string_translation = $this->prophesize(TranslationManager::class);
    $container = new ContainerBuilder();
    // $container->set('logger.factory', $logger_factory->reveal());
    $container->set('config.manager', $config_manager->reveal());
    $container->set('string_translation', $string_translation->reveal());

    \Drupal::setContainer($container);
  }

  /**
   *
   */
  public function testThatExceptionIsThrownIfPostDataIsMissing(): void {
    $container = \Drupal::getContainer();
    $controller = DplUrlProxyController::create($container);

    $this->expectException(HttpException::class);
    $this->expectExceptionMessage('Post body could not be decoded');

    $request = new Request();
    $controller->generateUrl($request);
  }

  /**
   *
   */
  public function testThatExceptionIsThrownIfPostDataIsNotContainingUrlProperty(): void {
    $container = \Drupal::getContainer();
    $controller = DplUrlProxyController::create($container);

    $this->expectException(HttpException::class);
    $this->expectExceptionMessage('Post body could not be decoded');

    $request = new Request([], ['foo' => 'bar']);
    $controller->generateUrl($request);
  }

  /**
   *
   */
  public function testThatExceptionIsThrownIfPostDataIsContainingMalignUrl(): void {
    $container = \Drupal::getContainer();
    $controller = DplUrlProxyController::create($container);

    $this->expectException(HttpException::class);
    $this->expectExceptionMessage('Provided url is not in the right format');

    $request = Request::create(
      '/dpl-url-proxy/generate-url',
      'POST', [], [], [], [], json_encode(['url' => 'foo'])
    );

    $controller->generateUrl($request);
  }

  public function testThatExceptionIsThrownIfPrefixIsNotSet(): void {
    $container = \Drupal::getContainer();
    $controller = DplUrlProxyController::create($container);

    $this->expectException(HttpException::class);
    $this->expectExceptionMessage('Could not resolve url. Insufficient configuration');

    $request = Request::create(
      '/dpl-url-proxy/generate-url',
      'POST', [], [], [], [], json_encode(['url' => 'http://foo.bar'])
    );

    $controller->generateUrl($request);
  }

  /**
   * @dataProvider testThatEndpointChangesUrlProvider
   */
  public function testThatEndpointChangesUrl($input, $expected_output, $conf): void {
    $config = $this->prophesize(ImmutableConfig::class);
    $config->get(Argument::any(), Argument::any())->willReturn($conf);

    $config_factory = $this->prophesize(ConfigFactoryInterface::class);
    $config_factory->get(DplUrlProxyInterface::CONFIG_NAME)->willReturn($config->reveal());

    $config_manager = $this->prophesize(ConfigManagerInterface::class);
    $config_manager->getConfigFactory()->willReturn($config_factory->reveal());

    $container = new ContainerBuilder();
    $container->set('config.manager', $config_manager->reveal());
    $controller = DplUrlProxyController::create($container);

    $request = Request::create(
      '/dpl-url-proxy/generate-url',
      'POST', [], [], [], [], json_encode($input)
    );

    $response = $controller->generateUrl($request);

    $this->assertEquals(
      json_encode($expected_output),
      $response->getContent()
    );
  }

  /**
   *
   */
  public function testThatEndpointChangesUrlProvider() {
    $conf = [
      'prefix' => 'http://bib101.bibbaser.dk/login?url=',
      'hostnames' => [
        [
          'hostname' => 'john.com',
          'expression' =>
          [
            'regex' => '/(.*)ohn(.*)/',
            'replacement' => '$1ane$2',
          ],
          'disable_prefix' => 0,
        ],
        [
          'hostname' => 'sally.com',
          'expression' =>
          [
            'regex' => '/(p)[a]+(lle)/',
            'replacement' => '$1o$2',
          ],
          'disable_prefix' => 1,
        ],
      ],
    ];

    return [
      [
        ['url' => 'http://john.com'],
        ['data' => 'http://bib101.bibbaser.dk/login?url=http://jane.com'],
        $conf
      ],
      [
        ['url' => 'http://sally.com?foo=palle'],
        ['data' => 'http://sally.com?foo=polle'],
        $conf
      ],
    ];
  }

}
