<?php

namespace Drupal\dpl_unilogin\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_unilogin\UniloginConfiguration;
use Drupal\graphql\GraphQL\Execution\FieldContext;
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
  public function resolve(FieldContext $field_context): array  {
    $field_context->addCacheableDependency((new CacheableMetadata())->setCacheMaxAge(0));
    return [
      'clientSecret' => $this->uniloginConfiguration->getUniloginApiClientSecret() ?: NULL,
      'webServiceUsername' => $this->uniloginConfiguration->getUniloginApiWebServiceUsername() ?: NULL,
      'webServicePassword' => $this->uniloginConfiguration->getUniloginApiWebServicePassword() ?: NULL,
      'pubHubRetailerKeyCode' => $this->uniloginConfiguration->getUniloginApiPubhubRetailerKeyCode() ?: NULL,
    ];
  }

}
