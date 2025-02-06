<?php

namespace Drupal\dpl_library_token;

use Drupal\Core\KeyValueStore\KeyValueExpirableFactoryInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\dpl_login\Adgangsplatformen\Config;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\RequestException;
use Psr\Log\LogLevel;

/**
 * Library Token Handler Service.
 */
class LibraryTokenHandler {

  const LIBRARY_TOKEN_KEY = 'library_token';
  const TOKEN_COLLECTION_KEY = 'dpl_library_token';
  const LOGGER_KEY = 'dpl_library_tokens';

  /**
   * Configuration for Adgangsplatformen.
   *
   * @var \Drupal\dpl_login\Adgangsplatformen\Config
   */
  protected $adgangsplatformenConfig;
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
   * @param \Drupal\dpl_login\Adgangsplatformen\Config $config
   *   Configuration.
   * @param \Drupal\Core\KeyValueStore\KeyValueExpirableFactoryInterface $keyValueFactory
   *   The key value expire keyValueFactory.
   * @param \GuzzleHttp\ClientInterface $http_client
   *   The HTTP client.
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $logger
   *   The library token logger channel.
   */
  public function __construct(
    Config $config,
    KeyValueExpirableFactoryInterface $keyValueFactory,
    ClientInterface $http_client,
    LoggerChannelFactoryInterface $logger,
  ) {
    $this->adgangsplatformenConfig = $config;
    $this->tokenCollection = $keyValueFactory->get(self::TOKEN_COLLECTION_KEY);
    $this->httpClient = $http_client;
    $this->logger = $logger->get(self::LOGGER_KEY);
  }

  /**
   * Retrieve token from external service and save it.
   */
  public function retrieveAndStoreToken(bool $force = FALSE): null|bool {
    // If force is False and if token is already stored.
    if (!$force && $this->getToken()) {
      return NULL;
    }

    // Try to fetch token, if not possible return false.
    if (!$token = $this->fetchToken()) {
      return FALSE;
    }

    // Set token.
    $this->setToken($token);
    return TRUE;
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
      ->setWithExpire(
        self::LIBRARY_TOKEN_KEY,
        $token->token,
        (int) round($token->expire / 2)
      );
  }

  /**
   * Get stored library token.
   */
  public function getToken(): ?string {
    return $this->tokenCollection->get(self::LIBRARY_TOKEN_KEY);
  }

  /**
   * Fetches and returns library token from remote service.
   *
   * @return \Drupal\dpl_library_token\LibraryToken|null
   *   If token was fetched it is returned. Otherwise, return NULL.
   */
  public function fetchToken(
    string $agencyId = NULL,
    string $clientId = NULL,
    string $clientSecret = NULL,
    string $tokenEndpoint = NULL,
  ): ?LibraryToken {
    $token = NULL;

    try {
      $agency = sprintf('@%d', $agencyId ?? $this->adgangsplatformenConfig->getAgencyId());

      $response = $this->httpClient
        ->request('POST', $tokenEndpoint ?? $this->adgangsplatformenConfig->getTokenEndpoint(), [
          'form_params' => [
            'grant_type' => 'password',
            'username' => $agency,
            'password' => $agency,
          ],
          'auth' => [
            $clientId ?? $this->adgangsplatformenConfig->getClientId(),
            $clientSecret ?? $this->adgangsplatformenConfig->getClientSecret(),
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
        // Since we already checked via RequestException::hasResponse
        // we do not need additional checking.
        /* @phpstan-ignore-next-line */
        $response_body = $e->getResponse()->getBody()->getContents();
        $variables['@error_message'] .= ' Response: ' . $response_body;
      }
      $this->logger->log(LogLevel::ERROR, '@message. Details: @error_message', $variables);
    }

    return $token;
  }

}
