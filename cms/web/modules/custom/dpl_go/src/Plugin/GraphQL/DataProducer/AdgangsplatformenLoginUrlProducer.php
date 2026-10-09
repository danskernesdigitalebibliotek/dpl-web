<?php

namespace Drupal\dpl_go\Plugin\GraphQL\DataProducer;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\UrlGeneratorInterface;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Resolves the Go login url for Adgangsplatformen.
 *
 * With an identity provider, e.g. Unilogin, the login goes through
 * Adgangsplatformen with that identity provider forced. Either way it lands on
 * the same Go login route.
 *
 * @DataProducer(
 *   id = "go_adgangsplatformen_login_url",
 *   name = "Adgangsplatformen Url Producer",
 *   description = "Provides the Adgangsplatformen login url for Go.",
 *   produces = @ContextDefinition("any",
 *     label = "Request Response"
 *   ),
 *   consumes = {
 *     "idp" = @ContextDefinition("string",
 *       label = "Identity provider to force",
 *       required = FALSE
 *     )
 *   }
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
   * Resolves the Adgangsplatformen login url for Go.
   *
   * @param string|null $idp
   *   The identity provider to force, if any.
   * @param \Drupal\graphql\GraphQL\Execution\FieldContext $field_context
   *   The field context.
   *
   * @return string
   *   The absolute login url.
   */
  public function resolve(?string $idp, FieldContext $field_context): string {
    $query = [
      'current-path' => $this->urlGenerator->generateFromRoute(
        'dpl_go.post_adgangsplatformen_login',
        [],
        // Skip OutboundPathProcessor here.
        ['path_processing' => FALSE],
      ),
    ];
    if ($idp) {
      $query['idp'] = $idp;
    }

    /** @var \Drupal\Core\GeneratedUrl $url */
    $url = $this->urlGenerator->generateFromRoute(
      'dpl_login.login',
      [],
      ['query' => $query, 'absolute' => TRUE],
      TRUE,
    );
    // The url depends on the host it is built on.
    $field_context->addCacheableDependency($url);

    return $url->getGeneratedUrl();
  }

}
