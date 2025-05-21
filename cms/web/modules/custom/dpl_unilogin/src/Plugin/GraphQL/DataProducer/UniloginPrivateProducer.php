<?php

namespace Drupal\dpl_unilogin\Plugin\GraphQL\DataProducer;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_unilogin\UniloginConfiguration;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Exposes Unilogin private information.
 *
 * @DataProducer(
 *   id = "unilogin_private_producer",
 *   name = "Unilogin Private Producer",
 *   description = "Exposes Unilogin sensitive information.",
 *   produces = @ContextDefinition("any",
 *     label = "Request Response"
 *   )
 * )
 */
class UniloginPrivateProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritDoc}
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
      'clientId' => $this->uniloginConfiguration->getUniloginApiClientId(),
      'clientSecret' => $this->uniloginConfiguration->getUniloginApiClientSecret(),
      'webServiceUsername' => $this->uniloginConfiguration->getUniloginApiWebServiceUsername(),
      'webServicePassword' => $this->uniloginConfiguration->getUniloginApiWebServicePassword(),
      'pubHubRetailerKeyCode' => $this->uniloginConfiguration->getUniloginApiPubhubRetailerKeyCode(),
    ];

    // Check if Unilogin configuration is empty and return NULL if it is.
    $unilogin_config_is_empty = (bool) array_filter(array_values($unilogin_config));
    return $unilogin_config_is_empty ? $unilogin_config : NULL;
  }

}
