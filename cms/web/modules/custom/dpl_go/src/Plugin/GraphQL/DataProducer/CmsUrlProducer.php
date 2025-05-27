<?php

namespace Drupal\dpl_go\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_go\GoSite;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Resolves the FB-CMS URL of the library.
 *
 * @DataProducer(
 *   id = "cms_url_producer",
 *   name = "FB-CMS URL Producer",
 *   description = "Provides the FB-CMS URL.",
 *   produces = @ContextDefinition("any",
 *     label = "Request Response"
 *   )
 * )
 */
class CmsUrlProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected GoSite $goSite,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('dpl_go.go_site'),
    );
  }

  /**
   * Resolves the library name.
   */
  public function resolve(FieldContext $field_context): string {
    $field_context->addCacheableDependency((new CacheableMetadata())->setCacheMaxAge(0));
    return $this->goSite->getCmsBaseUrl();
  }

}
