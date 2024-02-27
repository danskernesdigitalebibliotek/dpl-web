<?php

// dataProvider tag ordering conflicts with short descriptions.
// phpcs:ignoreFile Drupal.Commenting.DocComment.ParamNotFirst

namespace Drupal\Tests\dpl_library_token\Unit;

use Drupal\Core\Config\ConfigBase;
use Drupal\dpl_login\Adgangsplatformen\Config;
use Psr\Log\LoggerInterface;
use Psr\Log\LogLevel;
use Prophecy\Argument;
use GuzzleHttp\Psr7\Response;
use Drupal\Tests\UnitTestCase;
use GuzzleHttp\ClientInterface;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Logger\LoggerChannelInterface;
use Drupal\dpl_library_token\LibraryTokenHandler;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\KeyValueStore\KeyValueStoreExpirableInterface;
use Drupal\Core\KeyValueStore\KeyValueExpirableFactoryInterface;
use function Safe\json_encode as json_encode;

/**
 * Unit tests for the Library Token Handler.
 */
class LibraryTokenHandlerTest extends UnitTestCase {

  /**
   * Test behaviour when no token has been stored yet.
   */
  public function testIfNoTokenHasBeenStoredANewOneIsFetched(): void {
    $collection = $this->prophesize(KeyValueStoreExpirableInterface::class);
    // Simulate that we don't have any token in data store.
    $collection
      ->get(LibraryTokenHandler::LIBRARY_TOKEN_KEY)
      ->willReturn(NULL)
      ->shouldBeCalledTimes(1);
    // After a request to external service we expect the new token to be set.
    $collection->setWithExpire(
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

    $handler = $this->createTokenHandler(
      $key_value_factory->reveal(),
      $client->reveal()
    );
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
        '@error_message' => 'Syntax error',
      ]
    )->shouldBeCalledTimes(1);
    $logger_factory = $this->prophesize(LoggerChannelFactoryInterface::class);
    $logger_factory->get(LibraryTokenHandler::LOGGER_KEY)->willReturn($logger->reveal());

    $handler = $this->createTokenHandler(
      $key_value_factory->reveal(),
      $client->reveal(),
      $logger->reveal()
    );
    $handler->retrieveAndStoreToken();
  }

  /**
   * @dataProvider provideExceptionMessages
   *
   * Test that application will fail if the needed configuration is not set.
   *
   * @param string[]|null $settings
   *   Faulty configuration of the library token handler.
   * @param string $message
   *   The expected error message.
   */
  public function testItComplainsIfConfigurationIsNotSet(?array $settings, string $message): void {
    $collection = $this->prophesize(KeyValueStoreExpirableInterface::class);
    $key_value_factory = $this->prophesize(KeyValueExpirableFactoryInterface::class);
    $key_value_factory->get(LibraryTokenHandler::TOKEN_COLLECTION_KEY)
      ->willReturn($collection->reveal())
      ->shouldBeCalledTimes(1);

    $logger = $this->prophesize(LoggerChannelInterface::class);
    $logger->log(LogLevel::ERROR, Argument::any(), Argument::that(function(array $context) use ($message) {
      return $context['@error_message'] == $message;
    }))->shouldBeCalledTimes(1);
    $logger_factory = $this->prophesize(LoggerChannelFactoryInterface::class);
    $logger_factory->get(LibraryTokenHandler::LOGGER_KEY)->willReturn($logger->reveal());

    $client = $this->prophesize(ClientInterface::class);

    $config = $this->prophesize(ImmutableConfig::class);
    $config->get('settings')->willReturn($settings);

    $handler = $this->createTokenHandler(
      $key_value_factory->reveal(),
      $client->reveal(),
      $logger->reveal(),
      $config->reveal()
    );

    $handler->retrieveAndStoreToken();
  }

  /**
   * Dataprovider with settings and expected exception messages.
   *
   * @return mixed[]
   */
  public function provideExceptionMessages(): array {
    return [
      [
        [
          'agency_id' => 'agency_id',
          'client_id' => 'client_id',
          'client_secret' => 'client_secret',
        ],
        'Adgangsplatformen plugin config variable token_endpoint is missing',
      ],
      [
        [
          'agency_id' => 'agency_id',
          'token_endpoint' => 'token_endpoint',
          'client_secret' => 'client_secret',
        ],
        'Adgangsplatformen plugin config variable client_id is missing',
      ],
      [
        [
          'agency_id' => 'agency_id',
          'token_endpoint' => 'token_endpoint',
          'client_id' => 'client_id',
        ],
        'Adgangsplatformen plugin config variable client_secret is missing',
      ],
      [
        [
          'token_endpoint' => 'token_endpoint',
          'client_id' => 'client_id',
          'client_secret' => 'client_secret',
        ],
        'Adgangsplatformen plugin config variable agency_id is missing',
      ],
    ];
  }

  /**
   * Creates a Library Token Handler with mocked dependencies.
   */
  protected function createTokenHandler(
    KeyValueExpirableFactoryInterface $key_value_factory,
    ClientInterface $client,
    ?LoggerInterface $logger = NULL,
    ?ConfigBase $config = NULL
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
    $config_factory->get(Config::CONFIG_KEY)->willReturn($config);
    $adgangsplatformen_config = new Config($config_factory->reveal());

    if (!$logger) {
      $logger = $this->prophesize(LoggerChannelInterface::class)->reveal();
    }

    $logger_factory = $this->prophesize(LoggerChannelFactoryInterface::class);
    $logger_factory->get(LibraryTokenHandler::LOGGER_KEY)->willReturn($logger);

    return new LibraryTokenHandler(
      $adgangsplatformen_config,
      $key_value_factory,
      $client,
      $logger_factory->reveal()
    );
  }

}
