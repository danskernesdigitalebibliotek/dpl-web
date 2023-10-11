<?php

namespace Drupal\dpl_fbs;

use DanskernesDigitaleBibliotek\FBS\Api\ExternalAgencyidPatronsApi;
use DanskernesDigitaleBibliotek\FBS\Api\ExternalV1AgencyidApi;
use DanskernesDigitaleBibliotek\FBS\Configuration;
use Drupal\Core\Config\ConfigManagerInterface;
use Drupal\dpl_fbs\Form\FbsSettingsForm;
use GuzzleHttp\ClientInterface;

/**
 * Factory to generate FBS API instances.
 */
class FbsApiFactory {

  /**
   * FBS API factory constructor.
   *
   * @param \Drupal\Core\Config\ConfigManagerInterface $configManager
   *   The config manager.
   * @param \GuzzleHttp\ClientInterface $client
   *   The Guzzle client to use to connect to FBS.
   */
  public function __construct(
    protected ConfigManagerInterface $configManager,
    protected ClientInterface $client,
  ) {
  }

  /**
   * Assemble the API configuration.
   */
  protected function getConfiguration(string $token): Configuration {
    $config = $this->configManager->getConfigFactory()->get(FbsSettingsForm::CONFIG_KEY);

    $configuration = (new Configuration())
      ->setHost($config->get('base_url'))
      ->setAccessToken($token);

    return $configuration;
  }

  /**
   * Generate an agency API instance.
   */
  public function getAgencyApi(string $token): ExternalV1AgencyidApi {
    return new ExternalV1AgencyidApi(
      $this->client,
      $this->getConfiguration($token)
    );
  }

  /**
   * Generate a patron API instance.
   */
  public function getPatronApi(string $token): ExternalAgencyidPatronsApi {
    return new ExternalAgencyidPatronsApi(
      $this->client,
      $this->getConfiguration($token)
    );
  }

}
