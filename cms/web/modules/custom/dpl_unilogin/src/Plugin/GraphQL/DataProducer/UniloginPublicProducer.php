<?php

namespace Drupal\dpl_unilogin\Plugin\GraphQL\DataProducer;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_unilogin\UniloginConfiguration;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Exposes Unilogin public information.
 *
 * @DataProducer(
 *   id = "unilogin_public_producer",
 *   name = "Unilogin Public Producer",
 *   description = "Exposes Unilogin public information.",
 *   produces = @ContextDefinition("any",
 *     label = "Request Response"
 *   )
 * )
 */
class UnilogPublicProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('dpl_unilogin.settings')
     );
  }

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected UniloginConfiguration $uniloginConfiguration,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * Resolves the Unilogin info.
   *
   * @return mixed[]|null
   *   The Unilogin configuration.
   */
  public function resolve(): array | null {
    $unilogin_config = [
      'unilogin_api_url' => $this->uniloginConfiguration->getUniloginApiEndpoint(),
      'unilogin_api_wellknown_url' => $this->uniloginConfiguration->getUniloginApiWellknownEndpoint(),
      'unilogin_api_client_id' => $this->uniloginConfiguration->getUniloginApiClientId(),
      'unilogin_api_client_secret' => $this->uniloginConfiguration->getUniloginApiClientSecret(),
      'unilogin_api_municipality_id' => $this->uniloginConfiguration->getUniloginApiMunicipalityId(),
      'unilogin_api_services_ws_user' => $this->uniloginConfiguration->getUniloginApiWsUser(),
      'unilogin_api_services_ws_password' => $this->uniloginConfiguration->getUniloginApiWsPassword(),
      'unilogin_api_pubhub_retailer_key_code' => $this->uniloginConfiguration->getUniloginApiPubhubRetailerKeyCode(),
    ];

    // Check if Unilogin configuration is empty and return NULL if it is.
    $unilogin_config_is_empty = (bool) array_filter(array_values($unilogin_config));
    return $unilogin_config_is_empty ? $unilogin_config : NULL;
  }

}
