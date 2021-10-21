<?php

namespace Drupal\Tests\dpl_library_token\Unit;

use Psr\Log\LogLevel;
use Prophecy\Argument;
use GuzzleHttp\Psr7\Response;
use Drupal\Tests\UnitTestCase;
use GuzzleHttp\ClientInterface;
use Prophecy\Prophecy\ObjectProphecy;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Logger\LoggerChannelInterface;
use Drupal\dpl_library_token\LibraryTokenHandler;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\KeyValueStore\KeyValueStoreExpirableInterface;
use Drupal\Core\KeyValueStore\KeyValueExpirableFactoryInterface;
use Drupal\dpl_library_token\Exception\MissingConfigurationException;

/**
 * Unit tests proving that the phpUnit setup works.
 *
 * @group ci_test_demo_mk14
 */
class DplLibraryCronTest extends UnitTestCase {

  /**
   * Test behaviour when no token has been stored yet.
   */
  public function testIfNoTokenHasBeenStoredaNewOneIsFetched(): void {
    $collection = $this->prophesize(KeyValueStoreExpirableInterface::class);
    // Simulate that we don't have any token in data store.
    $collection
      ->get(LibraryTokenHandler::LIBRARY_TOKEN_KEY)
      ->willReturn(NULL)
      ->shouldBeCalledTimes(1);
    // After a request to external service we expect the new token to be set.
    $collection->setWithExpireIfNotExists(
        LibraryTokenHandler::LIBRARY_TOKEN_KEY,
        Argument::cetera()
      )
      ->shouldBeCalledTimes(1);
    $key_value_factory = $this->prophesize(KeyValueExpirableFactoryInterface::class);
    $key_value_factory->get(LibraryTokenHandler::TOKEN_COLLECTION_KEY)
      ->willReturn($collection->reveal())
      ->shouldBeCalledTimes(1);

    $client = $this->prophesize(ClientInterface::class);
    // Because we need a new token
    // we also expect a request to an external endpoint to happen.
    $client->request('POST', 'token_endpoint', Argument::any())
      ->will(function () {
        return new Response(
          200,
          [],
          json_encode([
            'access_token' => 'f7f71233253ca6cf8803f7aedd8c6563812a2650',
            'token_type' => 'Bearer',
            'expires_in' => 2591999,
          ])
        );
      })->shouldBeCalledTimes(1);

    $handler = $this->createTokenHandler($key_value_factory, $client);
    $handler->retrieveAndStoreToken();
  }

  /**
   * Log entry when the json from the library token response is malformed.
   */
  public function testItCanLogWhenTokenResponseIsMalformed(): void {
    $collection = $this->prophesize(KeyValueStoreExpirableInterface::class);
    // Simulate that we don't have any token in data store.
    $collection
      ->get(LibraryTokenHandler::LIBRARY_TOKEN_KEY)
      ->willReturn(NULL)
      ->shouldBeCalledTimes(1);
    $key_value_factory = $this->prophesize(KeyValueExpirableFactoryInterface::class);
    $key_value_factory->get(LibraryTokenHandler::TOKEN_COLLECTION_KEY)
      ->willReturn($collection->reveal())
      ->shouldBeCalledTimes(1);

    $client = $this->prophesize(ClientInterface::class);
    // Simulate a malformed json response.
    $client->request('POST', 'token_endpoint', Argument::any())
      ->will(function () {
        return new Response(200, [], 'Non valid json string');
      });

    // Since we get invalid json from the library token response
    // there should be an error entry in the log.
    $logger = $this->prophesize(LoggerChannelInterface::class);
    $logger->log(
      LogLevel::ERROR,
      '@message. Details: @error_message',
      [
        '@message' => 'Could not retrieve library token',
        '@error_message' => 'Could not decode library token response',
      ]
    )->shouldBeCalledTimes(1);
    $logger_factory = $this->prophesize(LoggerChannelFactoryInterface::class);
    $logger_factory->get(LibraryTokenHandler::LOGGER_KEY)->willReturn($logger->reveal());

    $handler = $this->createTokenHandler($key_value_factory, $client, $logger);
    $handler->retrieveAndStoreToken();
  }

  /**
   * Test that application will fail if the needed configuratin is not set.
   *
   * @dataProvider provideExceptionMessages
   */
  public function testItComplainsIfConfigurationIsNotSet(?array $settings, string $message): void {
    $collection = $this->prophesize(KeyValueStoreExpirableInterface::class);
    $key_value_factory = $this->prophesize(KeyValueExpirableFactoryInterface::class);
    $key_value_factory->get(LibraryTokenHandler::TOKEN_COLLECTION_KEY)
      ->willReturn($collection->reveal())
      ->shouldBeCalledTimes(1);

    $logger = $this->prophesize(LoggerChannelInterface::class);
    $logger_factory = $this->prophesize(LoggerChannelFactoryInterface::class);
    $logger_factory->get(LibraryTokenHandler::LOGGER_KEY)->willReturn($logger->reveal());

    $client = $this->prophesize(ClientInterface::class);

    $config = $this->prophesize(ImmutableConfig::class);
    $config->get('settings')->willReturn($settings);

    $this->expectException(MissingConfigurationException::class);
    $this->expectExceptionMessage($message);
    $handler = $this->createTokenHandler($key_value_factory, $client, $logger, $config);

    $handler->retrieveAndStoreToken();
  }

  /**
   * Dataprovider with settings and expected exception messages.
   */
  public function provideExceptionMessages() {
    return [
      [
        NULL,
        'Config variable token_endpoint is missing',
      ],
      [
        [
          'token_endpoint' => 'token_endpoint',
        ],
        'Config variable client_id is missing',
      ],
      [
        [
          'token_endpoint' => 'token_endpoint',
          'client_id' => 'client_id',
        ],
        'Config variable client_secret is missing',
      ],
      [
        [
          'token_endpoint' => 'token_endpoint',
          'client_id' => 'client_id',
          'client_secret' => 'client_secret',
        ],
        'Config variable agency_id is missing',
      ],
    ];
  }

  /**
   * Creates a Library Token Handler with mocked dependencies.
   *
   * @param Prophecy\Prophecy\ObjectProphecy $key_value_factory
   *   Mocked key/value store.
   * @param Prophecy\Prophecy\ObjectProphecy $client
   *   Mocked http client.
   * @param Prophecy\Prophecy\ObjectProphecy|null $logger
   *   Mocked logger service.
   * @param Prophecy\Prophecy\ObjectProphecy|null $config
   *   Mocked config service.
   *
   * @return Drupal\dpl_library_token\LibraryTokenHandler
   *   The Library Token handler service.
   */
  protected function createTokenHandler(
    ObjectProphecy $key_value_factory,
    ObjectProphecy $client,
    ?ObjectProphecy $logger = NULL,
    ?ObjectProphecy $config = NULL
  ): LibraryTokenHandler {

    if (!$config) {
      $config = $this->prophesize(ImmutableConfig::class);
      $config->get('settings')->willReturn([
        'client_id' => 'client_id',
        'client_secret' => 'client_secret',
        'redirect_url' => 'redirect_url',
        'authorization_endpoint' => 'authorization_endpoint',
        'token_endpoint' => 'token_endpoint',
        'userinfo_endpoint' => 'userinfo_endpoint',
        'agency_id' => 99999,
      ]);
    }
    $config_factory = $this->prophesize(ConfigFactoryInterface::class);
    $config_factory->get(LibraryTokenHandler::SETTINGS_KEY)->willReturn($config->reveal());

    if (!$logger) {
      $logger = $this->prophesize(LoggerChannelInterface::class);
    }

    $logger_factory = $this->prophesize(LoggerChannelFactoryInterface::class);
    $logger_factory->get(LibraryTokenHandler::LOGGER_KEY)->willReturn($logger->reveal());

    return new LibraryTokenHandler(
      $key_value_factory->reveal(),
      $config_factory->reveal(),
      $client->reveal(),
      $logger_factory->reveal()
    );
  }

}
