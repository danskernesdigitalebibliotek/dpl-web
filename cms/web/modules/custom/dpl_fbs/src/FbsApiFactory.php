<?php

namespace Drupal\dpl_fbs;

use DanskernesDigitaleBibliotek\FBS\Api\ExternalV1AgencyidApi;
use DanskernesDigitaleBibliotek\FBS\Configuration;
use Drupal\Core\Config\ConfigManagerInterface;
use Drupal\dpl_fbs\Form\FbsSettingsForm;
use Drupal\dpl_library_token\LibraryTokenHandler;
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
   * @param \Drupal\dpl_library_token\LibraryTokenHandler $tokenHandler
   *   The token handler to retrieve the library token used for authentication.
   */
  public function __construct(
    protected ConfigManagerInterface $configManager,
    protected ClientInterface $client,
    protected LibraryTokenHandler $tokenHandler
  ) {
  }

  /**
   * Assemble the API configuration.
   */
  protected function getConfiguration(): Configuration {
    $config = $this->configManager->getConfigFactory()->get(FbsSettingsForm::CONFIG_KEY);
    $configuration = (new Configuration())
      ->setHost($config->get('base_url'));

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
