<?php

namespace Drupal\dpl_library_token;

use Psr\Log\LogLevel;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\RequestException;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\KeyValueStore\KeyValueExpirableFactoryInterface;
use Drupal\dpl_library_token\Exception\MissingConfigurationException;

/**
 * Library Token Handler Service.
 */
class LibraryTokenHandler {

  const LIBRARY_TOKEN_KEY = 'library_token';
  const TOKEN_COLLECTION_KEY = 'dpl_library_token';
  const NEXT_EXECUTION_KEY = 'dpl_library_token.next_execution';
  const SETTINGS_KEY = 'openid_connect.settings.adgangsplatformen';
  const LOGGER_KEY = 'dpl_library_tokens';

  /**
   * Cron Configuration.
   *
   * @var mixed[]
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
   * @var \GuzzleHttp\ClientInterface
   */
  protected $httpClient;
  /**
   * The logger.
   *
   * @var \Drupal\Core\Logger\LoggerChannelInterface
   */
  protected $logger;

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
    $this->tokenCollection = $keyValueFactory->get(self::TOKEN_COLLECTION_KEY);
    $this->settings = $configFactory
      ->get(self::SETTINGS_KEY)->get('settings');
    $this->httpClient = $http_client;
    $this->logger = $logger->get(self::LOGGER_KEY);

    $this->validateSettings();
  }

  /**
   * Retrieve token from external service and save it.
   */
  public function retrieveAndStoreToken(): void {
    // If no token stored.
    if (!$this->getToken()) {
      // Then try to fetch one.
      if ($token = $this->fectchToken()) {
        // And store it.
        $this->setToken($token);
      }
    }
  }

  /**
   * Store a new Library Token.
   *
   * @param \Drupal\dpl_library_token\LibraryToken $token
   *   The Token to store.
   */
  public function setToken(LibraryToken $token): void {
    // Set token and expire time to half the given one.
    // In that way we are sure that the token is always valid.
    $this->tokenCollection
      ->setWithExpireIfNotExists(
        self::LIBRARY_TOKEN_KEY,
        $token->token,
        (int) round($token->expire / 2)
      );
  }

  /**
   * Get stored library token.
   *
   * @return string|null
   *   The token if found or else NULL.
   */
  public function getToken(): ?string {
    return $this->tokenCollection->get(self::LIBRARY_TOKEN_KEY);
  }

  /**
   * Fetches and returns library token from remote service.
   *
   * @return \Drupal\dpl_library_token\LibraryToken|null
   *   If token was fetched it is returned. Otherwise NULL.
   */
  public function fectchToken(): ?LibraryToken {
    $token = NULL;

    try {
      $agency = sprintf('@%d', $this->settings['agency_id']);

      $response = $this->httpClient
        ->request('POST', $this->settings['token_endpoint'], [
          'form_params' => [
            'grant_type' => 'password',
            'username' => $agency,
            'password' => $agency,
          ],
          'auth' => [
            $this->settings['client_id'],
            $this->settings['client_secret'],
          ],
        ]);

      $response_body = (string) $response->getBody();
      // Get token from payload.
      // If createFromResponseBody is not able to create a token
      // from $response_body, an exception is thrown
      // and the success log entry will not be created.
      $token = LibraryToken::createFromResponseBody($response_body);

      $this->logger->log(LogLevel::INFO, 'New token was fetched.');
    }
    catch (\Exception $e) {
      $variables = [
        '@message' => 'Could not retrieve library token',
        '@error_message' => $e->getMessage(),
      ];

      if ($e instanceof RequestException && $e->hasResponse()) {
        if ($response = $e->getResponse()) {
          $response_body = $response->getBody()->getContents();
          $variables['@error_message'] .= ' Response: ' . $response_body;
        }
      }
      $this->logger->log(LogLevel::ERROR, '@message. Details: @error_message', $variables);
    }

    return $token;
  }

  /**
   * Validate settings. Exception is thrown if a setting is missing.
   */
  protected function validateSettings(): void {
    foreach ([
      'token_endpoint',
      'client_id',
      'client_secret',
      'agency_id',
    ] as $config_key) {
      if (empty($this->settings[$config_key])) {
        throw new MissingConfigurationException(
          sprintf('Config variable %s is missing', $config_key)
        );
      }
    }
  }

}
