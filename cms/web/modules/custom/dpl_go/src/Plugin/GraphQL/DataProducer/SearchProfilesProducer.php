<?php

namespace Drupal\dpl_go\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_library_agency\FbiProfileType;
use Drupal\dpl_library_agency\GeneralSettings;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Resolves search profiles configuration for the library.
 *
 * @DataProducer(
 *   id = "search_profiles_producer",
 *   name = "Library Search Profiles Producer",
 *   description = "Provides the library search profile configuration.",
 *   produces = @ContextDefinition("any",
 *     label = "Request Response"
 *   )
 * )
 */
class SearchProfilesProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected GeneralSettings $generalSettings,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * @inheritDoc
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('dpl_library_agency.general_settings')
    );
  }

  /**
   * Resolves the Unilogin info.
   *
   * @return mixed[]
   *   The Unilogin configuration.
   */
  public function resolve(FieldContext $field_context): array {
    $field_context->addCacheableDependency((new CacheableMetadata())->setCacheMaxAge(0));
    return [
      'defaultProfile' => $this->generalSettings->getFbiProfile(FbiProfileType::DEFAULT) ?: NULL,
      'searchProfile' => $this->generalSettings->getFbiProfile(FbiProfileType::LOCAL) ?: NULL,
      'materialProfile' => $this->generalSettings->getFbiProfile(FbiProfileType::GLOBAL) ?: NULL,
    ];
  }

}
