<?php

namespace Drupal\dpl_library_token;

use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\RequestException;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\KeyValueStore\KeyValueExpirableFactoryInterface;

/**
 * Library Token Handler Service.
 */
class LibraryTokenHandler {

  const LIBRARY_TOKEN_KEY = 'library_token';
  const NEXT_EXECUTION_KEY = 'dpl_library_token.next_execution';
  const LIBRARY_TOKEN_ENDPOINT_DEFAULT = 'https://run.mocky.io/v3/ea0dd0ee-046e-43fc-a45f-cf1d9691a395';

  /**
   * The key value expire keyValueFactory.
   *
   * @var \Drupal\Core\KeyValueStore\KeyValueExpirableFactoryInterface
   */
  protected $keyValueFactory;
  /**
   * The state key value store.
   *
   * @var \Drupal\Core\State\State
   */
  protected $state;
  /**
   * Configuration.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;
  /**
   * Cron Configuration.
   *
   * @var \Drupal\Core\Config\Config|\Drupal\Core\Config\ImmutableConfig
   */
  protected $settings;
  /**
   * Key value store.
   *
   * @var \Drupal\Core\KeyValueStore\KeyValueStoreExpirableInterface
   */
  protected $tokenCollection;
  /**
   * The HTTP client.
   *
   * @var \GuzzleHttp\Client
   */
  protected $httpClient;

  /**
   * Constructs the LibraryTokenHandler service.
   *
   * @param \Drupal\Core\KeyValueStore\KeyValueExpirableFactoryInterface $keyValueFactory
   *   The key value expire keyValueFactory.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Configuration.
   * @param \GuzzleHttp\ClientInterface $http_client
   *   The HTTP client.
   * @param Drupal\Core\Logger\LoggerChannelFactoryInterface $logger
   *   The library token logger channel.
   */
  public function __construct(
    KeyValueExpirableFactoryInterface $keyValueFactory,
    ConfigFactoryInterface $configFactory,
    ClientInterface $http_client,
    LoggerChannelFactoryInterface $logger
  ) {
    $this->keyValueFactory = $keyValueFactory;
    /** @var \Drupal\Core\KeyValueStore\KeyValueStoreExpirableInterface */
    $this->tokenCollection = $keyValueFactory->get('dpl_cms_library_tokens');
    $this->configFactory = $configFactory;
    $this->settings = $this->configFactory
      ->get('dpl_library_token.settings');
    $this->httpClient = $http_client;
    $this->logger = $logger->get('dpl_library_tokens');
  }

  /**
   * Retrieve token from external service and save it.
   */
  public function retrieveAndStoreToken(): void {
    if (!$this->tokenCollection->get(self::LIBRARY_TOKEN_KEY)) {
      $token = $this->fectchToken();
      // Set token and expire time to half the given one.
      // In that way we are sure that the token is always valid.
      $this->tokenCollection
        ->setWithExpireIfNotExists(
          self::LIBRARY_TOKEN_KEY,
          $this->fectchToken(),
          round($token->expire / 2)
      );
    }
  }

  /**
   * Fetches and returns library token from remote service.
   *
   * @return Drupal\dpl_library_token\LibraryToken|null
   *   If token was fetched it is returned. Otherwise NULL.
   */
  protected function fectchToken() {
    $token = NULL;
    $request_options = [];

    try {
      $endpoint = $this->settings
        ->get('endpoint') ?? self::LIBRARY_TOKEN_ENDPOINT_DEFAULT;
      $response = $this->httpClient
        ->request('GET', $endpoint, $request_options);

      $response_body = (string) $response->getBody();

      // Get token from payload.
      if (!$token = LibraryToken::createFromResponseBody($response_body) ?? NULL) {
        throw new LibraryTokenResponseException('Could not retrieve token from response body');
      }

      $this->logger->log('New token was fetched.');
    }
    catch (\Exception $e) {
      $variables = [
        '@message' => 'Could not retrieve library token',
        '@error_message' => $e->getMessage(),
      ];

      if ($e instanceof RequestException && $e->hasResponse()) {
        $response_body = $e->getResponse()->getBody()->getContents();
        $variables['@error_message'] .= ' Response: ' . $response_body;
      }
      $this->logger->error('@message. Details: @error_message', $variables);
    }

    return $token;
  }

}
