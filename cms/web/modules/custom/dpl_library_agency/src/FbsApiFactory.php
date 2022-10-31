<?php

namespace Drupal\dpl_library_agency;

use DanskernesDigitaleBibliotek\FBS\Api\ExternalV1AgencyidApi;
use DanskernesDigitaleBibliotek\FBS\Configuration;
use Drupal\dpl_library_token\LibraryTokenHandler;
use GuzzleHttp\ClientInterface;

/**
 * Factory to generate FBS API instances.
 */
class FbsApiFactory {

  /**
   * The Guzzle client to use to connect to FBS.
   *
   * @var \GuzzleHttp\ClientInterface
   */
  protected $client;

  /**
   * The token handler to retrieve the library token used for authentication.
   *
   * @var \Drupal\dpl_library_token\LibraryTokenHandler
   */
  protected $tokenHandler;

  /**
   * FBS API factory constructor.
   */
  public function __construct(ClientInterface $client, LibraryTokenHandler $tokenHandler) {
    $this->client = $client;
    $this->tokenHandler = $tokenHandler;
  }

  /**
   * Assemble the API configuration.
   */
  protected function getConfiguration(): Configuration {
    $configuration = (new Configuration())
      // @todo FBS host name should be configurable.
      // This would preferably be managed in a central FBS module.
      ->setHost('https://fbs-openplatform.dbc.dk');

    $token = $this->tokenHandler->getToken();
    if ($token) {
      $configuration->setAccessToken($token);
    }

    return $configuration;
  }

  /**
   * Generate an agency API instance.
   */
  public function getAgencyApi(): ExternalV1AgencyidApi {
    return new ExternalV1AgencyidApi(
      $this->client,
      $this->getConfiguration()
    );
  }

}
