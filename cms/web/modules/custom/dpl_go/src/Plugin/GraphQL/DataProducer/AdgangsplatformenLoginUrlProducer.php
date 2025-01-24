<?php

namespace Drupal\dpl_go\Plugin\GraphQL\DataProducer;

use Drupal\Core\GeneratedUrl;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\UrlGeneratorInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Resolves the Go login url for Adgangsplatformen.
 *
 * Eg. wellknown url and client id and secret.
 *
 * @DataProducer(
 *   id = "go_adgangsplatformen_login_url",
 *   name = "Adgangsplatformen Url Producer",
 *   description = "Provides the Adgangsplatformen login url for Go.",
 *   produces = @ContextDefinition("any",
 *     label = "Request Response"
 *   )
 * )
 */
class AdgangsplatformenLoginUrlProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('url_generator')
     );
  }

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected UrlGeneratorInterface $urlGenerator,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * Resolves the unilogin info.
   */
  public function resolve(): GeneratedUrl | string {
    return $this->urlGenerator->generateFromRoute(
        'dpl_login.login',
        [
          'current-path' => $this->urlGenerator->generateFromRoute(
            'dpl_go.post_adgangsplatformen_login'
          ),
        ],
        ['absolute' => TRUE]
      );
  }

}
