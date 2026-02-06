<?php

namespace Drupal\dpl_go\Plugin\GraphQL\DataProducer;

use Drupal\Core\GeneratedUrl;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\UrlGeneratorInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Resolves the Go logout url for Adgangsplatformen.
 *
 * @DataProducer(
 *   id = "go_adgangsplatformen_logout_url",
 *   name = "Adgangsplatformen Url Producer",
 *   description = "Provides the Adgangsplatformen logout url for Go.",
 *   produces = @ContextDefinition("any",
 *     label = "Request Response"
 *   )
 * )
 */
class AdgangsplatformenLogoutUrlProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

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
   * Resolves Adgangsplatformen logout url for Go.
   */
  public function resolve(): GeneratedUrl | string {
    return $this->urlGenerator->generateFromRoute(
        'dpl_login.logout',
        [
          'current-path' => $this->urlGenerator->generateFromRoute(
            'dpl_go.post_adgangsplatformen_logout'
          ),
        ],
        ['absolute' => TRUE]
      );
  }

}
