<?php

namespace Drupal\Tests\dpl_library_token\Unit;

use Prophecy\Argument;
use Drupal\Tests\UnitTestCase;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ConfigManagerInterface;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\StringTranslation\TranslationManager;
use Drupal\dpl_url_proxy\Controller\DplUrlProxyController;
use Drupal\dpl_url_proxy\DplUrlProxyInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use function Safe\json_encode;

/**
 * Unit tests for the Library Token Handler.
 */
class DplUrlProxyControllerTest extends UnitTestCase {

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
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
    $container->set('config.manager', $config_manager->reveal());
    $container->set('string_translation', $string_translation->reveal());

    \Drupal::setContainer($container);
  }

  /**
   * Exception should be thrown if post data is missing.
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
   * Exception should be thrown if post data do not contain an url.
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
   * Exception should be thrown if url is not valid.
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

  /**
   * Exception should be thrown if the required prefix has not been configured.
   */
  public function testThatExceptionIsThrownIfPrefixIsNotSet(): void {
    $container = \Drupal::getContainer();
    $controller = DplUrlProxyController::create($container);

    $this->expectException(HttpException::class);
    $this->expectExceptionMessage('Could not generate url. Insufficient configuration');

    if ($request_body = json_encode(['url' => 'http://foo.bar'])) {
      $request = Request::create(
        '/dpl-url-proxy/generate-url',
        'POST', [], [], [], [], $request_body
      );
      $controller->generateUrl($request);
    }
  }

  /**
   * Data provider for testThatUrlIsGenerated.
   *
   * @param mixed[] $input
   *   The input from the request body.
   * @param mixed[] $expected_output
   *   The expected output from the endpoint.
   * @param mixed[] $conf
   *   The proxy url configuration to use.
   *
   * @dataProvider testThatEndpointChangesUrlProvider
   */
  public function testThatEndpointChangesUrl(array $input, array $expected_output, array $conf): void {
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
   * Data provider for testThatEndpointChangesUrl.
   *
   * @return mixed[]
   *   The test data.
   */
  public function testThatEndpointChangesUrlProvider(): array {
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
        $conf,
      ],
      [
        ['url' => 'http://sally.com?foo=palle'],
        ['data' => 'http://sally.com?foo=polle'],
        $conf,
      ],
    ];
  }

}
