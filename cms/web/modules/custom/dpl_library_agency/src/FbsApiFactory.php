<?php

namespace Drupal\dpl_library_agency;

use DanskernesDigitaleBibliotek\FBS\Api\ExternalV1AgencyidApi;
use DanskernesDigitaleBibliotek\FBS\Configuration;
use Drupal\Core\Config\ConfigManagerInterface;
use Drupal\dpl_library_token\LibraryTokenHandler;
use GuzzleHttp\ClientInterface;

/**
 * Factory to generate FBS API instances.
 */
class FbsApiFactory {

  /**
   * The config manager.
   *
   * @var \Drupal\Core\Config\ConfigManagerInterface
   */
  protected $configManager;

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
  public function __construct(ConfigManagerInterface $configManager, ClientInterface $client, LibraryTokenHandler $tokenHandler) {
    $this->configManager = $configManager;
    $this->client = $client;
    $this->tokenHandler = $tokenHandler;
  }

  /**
   * Assemble the API configuration.
   */
  protected function getConfiguration(): Configuration {
    // @todo FBS host name should be configurable through a central FBS module.
    // This configuration assumes that we know what a future structure will be
    // but the primary point to allow external control through *.settings.php
    $config = $this->configManager->getConfigFactory()->get('dpl_fbs.settings');
    $host = $config->get('host') ?? 'https://fbs-openplatform.dbc.dk';
    $configuration = (new Configuration())
      ->setHost($host);

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
