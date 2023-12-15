<?php

namespace Drupal\Tests\dpl_library_token\Unit;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ConfigManagerInterface;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\Logger\LoggerChannelFactory;
use Drupal\Core\Logger\LoggerChannelInterface;
use Drupal\Core\StringTranslation\TranslationManager;
use Drupal\dpl_url_proxy\DplUrlProxyInterface;
use Drupal\dpl_url_proxy\Plugin\rest\resource\UrlProxyResource;
use Drupal\Tests\UnitTestCase;
use Prophecy\Argument;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBag;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Unit tests for the Library Token Handler.
 */
class UrlProxyResourceTest extends UnitTestCase {

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $config = $this->prophesize(ImmutableConfig::class);
    $config->get('values')->willReturn([
      'prefix' => '',
      'hostnames' => [],
    ]);

    $config_factory = $this->prophesize(ConfigFactoryInterface::class);
    $config_factory->get(DplUrlProxyInterface::CONFIG_NAME)->willReturn($config->reveal());

    $config_manager = $this->prophesize(ConfigManagerInterface::class);
    $config_manager->getConfigFactory()->willReturn($config_factory->reveal());

    $string_translation = $this->prophesize(TranslationManager::class);

    $logger = $this->prophesize(LoggerChannelInterface::class);
    $logger_factory = $this->prophesize(LoggerChannelFactory::class);
    $logger_factory->get('rest')->willReturn($logger->reveal());

    $params = new ParameterBag([
      'serializer.formats' => [],
    ]);
    $container = new ContainerBuilder($params);
    $container->set('config.manager', $config_manager->reveal());
    $container->set('string_translation', $string_translation->reveal());
    $container->set('logger.factory', $logger_factory->reveal());

    \Drupal::setContainer($container);
  }

  /**
   * Exception should be thrown if the url does not contain an url.
   */
  public function testThatExceptionIsThrownIfUrlParamMissing(): void {
    $container = \Drupal::getContainer();
    $resource = UrlProxyResource::create($container, [], '', []);

    $this->expectException(HttpException::class);
    $this->expectExceptionMessage('Url parameter is missing');

    $request = new Request();
    $resource->get($request);
  }

  /**
   * Exception should be thrown if url is not valid.
   */
  public function testThatExceptionIsThrownIfPostDataIsContainingMalignUrl(): void {
    $container = \Drupal::getContainer();
    $resource = UrlProxyResource::create($container, [], '', []);

    $this->expectException(HttpException::class);
    $this->expectExceptionMessage('Url foo does not contain a host name. Urls to be proxied must contain a host name.');

    $request = Request::create('/dpl-url-proxy', 'GET', ['url' => 'foo']);
    $resource->get($request);
  }

  /**
   * Exception should be thrown if the required prefix has not been configured.
   */
  public function testThatExceptionIsThrownIfPrefixIsNotSet(): void {
    $container = \Drupal::getContainer();
    $resource = UrlProxyResource::create($container, [], '', []);

    $this->expectException(HttpException::class);
    $this->expectExceptionMessage('Could not generate url. Insufficient configuration');

    $request = Request::create(
      '/dpl-url-proxy',
      'GET',
      ['url' => 'http://foo.bar']
    );
    $resource->get($request);
  }

  /**
   * Test that the url is generated correctly.
   *
   * @param mixed[] $input
   *   The input from the request body.
   * @param mixed[] $expected_output
   *   The expected output from the endpoint.
   * @param mixed[] $conf
   *   The proxy url configuration to use.
   *
   * @dataProvider thatEndpointChangesUrlProvider
   */
  public function testThatEndpointChangesUrl(array $input, array $expected_output, array $conf): void {
    $config = $this->prophesize(ImmutableConfig::class);
    $config->getCacheTags()->willReturn([]);
    $config->get(Argument::any(), Argument::any())->willReturn($conf);

    $config_factory = $this->prophesize(ConfigFactoryInterface::class);
    $config_factory->get(DplUrlProxyInterface::CONFIG_NAME)->willReturn($config->reveal());

    $config_manager = $this->prophesize(ConfigManagerInterface::class);
    $config_manager->getConfigFactory()->willReturn($config_factory->reveal());

    $container = \Drupal::getContainer();
    $container->set('config.manager', $config_manager->reveal());

    $resource = UrlProxyResource::create($container, [], '', []);
    $request = Request::create('/dpl-url-proxy', 'GET', $input);
    $response = $resource->get($request);

    $this->assertEquals(
      $expected_output,
      $response->getResponseData()
    );
  }

  /**
   * Data provider for testThatEndpointChangesUrl.
   *
   * @return mixed[]
   *   The test data.
   */
  public function thatEndpointChangesUrlProvider(): array {
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
        ['data' => ['url' => 'http://bib101.bibbaser.dk/login?url=http://jane.com']],
        $conf,
      ],
      [
        ['url' => 'http://sally.com?foo=palle'],
        ['data' => ['url' => 'http://sally.com?foo=polle']],
        $conf,
      ],
    ];
  }

}
