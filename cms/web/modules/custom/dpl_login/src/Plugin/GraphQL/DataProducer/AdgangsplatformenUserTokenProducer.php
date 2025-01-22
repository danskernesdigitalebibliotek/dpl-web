<?php

namespace Drupal\dpl_login\Plugin\GraphQL\DataProducer;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_login\UserTokens;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Exposes an Adgangsplatformen user token.
 *
 * If a patron has been authenticated an access token should be available.
 * Otherwise NULL is returned.
 *
 * @DataProducer(
 *   id = "adgangsplatformen_user_token_producer",
 *   name = "Adgangsplatformen User Token Producer",
 *   description = "Exposes user access tokens.",
 *   produces = @ContextDefinition("any",
 *     label = "Request Response"
 *   )
 * )
 */
class AdgangsplatformenUserTokenProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * Creates an instance of the producer using dependency injection.
   *
   * This method ensures the necessary services, such as the logger and importer
   * are available for processing the import request.
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('dpl_login.user_tokens'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected UserTokens $userTokens,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * Resolves the access token based on the token type.
   */
  public function resolve(): string | null {
    return $this->userTokens->getCurrent()?->token;
  }

}
