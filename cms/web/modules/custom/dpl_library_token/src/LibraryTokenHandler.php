<?php

namespace Drupal\dpl_library_token;

use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\RequestException;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\KeyValueStore\KeyValueExpirableFactoryInterface;
use Psr\Log\LogLevel;

/**
 * Library Token Handler Service.
 */
class LibraryTokenHandler {

  const LIBRARY_TOKEN_KEY = 'library_token';
  const TOKEN_COLLECTION_KEY = 'dpl_cms_library_tokens';
  const NEXT_EXECUTION_KEY = 'dpl_library_token.next_execution';
  const SETTINGS_KEY = 'openid_connect.settings.adgangsplatformen';
  const LOGGER_KEY = 'dpl_library_tokens';

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
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $logger
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
    $this->tokenCollection = $keyValueFactory->get(self::TOKEN_COLLECTION_KEY);
    $this->configFactory = $configFactory;
    $this->settings = $this->configFactory
      ->get(self::SETTINGS_KEY)->get('settings');
    $this->httpClient = $http_client;
    $this->logger = $logger->get(self::LOGGER_KEY);
  }

  /**
   * Retrieve token from external service and save it.
   */
  public function retrieveAndStoreToken(): void {
    if (!$this->tokenCollection->get(self::LIBRARY_TOKEN_KEY)) {
      if ($token = $this->fectchToken()) {
        // Set token and expire time to half the given one.
        // In that way we are sure that the token is always valid.
        $this->tokenCollection
          ->setWithExpireIfNotExists(
            self::LIBRARY_TOKEN_KEY,
            $token->token,
            round($token->expire / 2)
        );
      }
    }
  }

  /**
   * Fetches and returns library token from remote service.
   *
   * @return \Drupal\dpl_library_token\LibraryToken|null
   *   If token was fetched it is returned. Otherwise NULL.
   */
  protected function fectchToken(): ?LibraryToken {
    $token = NULL;

    try {
      // TODO: Agency id should be moved to adgangsplatformen settings.
      $agency_token = sprintf('@%d', 710100);

      $response = $this->httpClient
        ->request('POST', $this->settings['token_endpoint'], [
          'form_params' => [
            'grant_type' => 'password',
            'username' => $agency_token,
            'password' => $agency_token,
          ],
          'auth' => [
            $this->settings['client_id'],
            $this->settings['client_secret'],
          ],
        ]);

      $response_body = (string) $response->getBody();
      // Get token from payload.
      if (!$token = LibraryToken::createFromResponseBody($response_body) ?? NULL) {
        throw new LibraryTokenResponseException('Could not retrieve token from response body');
      }

      $this->logger->log(LogLevel::INFO, 'New token was fetched.');
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
      $this->logger->log(LogLevel::ERROR, '@message. Details: @error_message', $variables);
    }

    return $token;
  }

  /**
   * Get stored library token.
   *
   * @return string|null
   *   The token if found or else NULL.
   */
  public function getToken(): ?string {
    return $this->tokenCollection->get(self::LIBRARY_TOKEN_KEY, NULL);
  }

}
