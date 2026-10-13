<?php

namespace Drupal\dpl_go\Plugin\GraphQL\DataProducer;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_biblio\DplBiblioSettings;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Resolves the Biblio adapter configuration for GO.
 *
 * @DataProducer(
 *   id = "go_biblio_configuration_producer",
 *   name = "Go Biblio Configuration Producer",
 *   description = "Provides the Biblio adapter configuration for GO.",
 *   produces = @ContextDefinition("any",
 *     label = "Request Response"
 *   )
 * )
 */
class GoBiblioConfigurationProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected ?DplBiblioSettings $biblioSettings,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): self {
    // dpl_go does not depend on dpl_biblio - no module can be assumed
    // enabled in the distribution.
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->has(DplBiblioSettings::class) ? $container->get(DplBiblioSettings::class) : NULL,
    );
  }

  /**
   * Resolves the Biblio adapter configuration for GO.
   *
   * @return mixed[]
   *   The configuration, shaped as the GoBiblioConfiguration GraphQL type.
   */
  public function resolve(FieldContext $field_context): array {
    if ($this->biblioSettings === NULL) {
      return [
        'enabled' => FALSE,
        'baseUrl' => NULL,
        'sdk' => NULL,
      ];
    }

    $field_context->addCacheableDependency($this->biblioSettings);

    $sdk_config = $this->biblioSettings->getSdkConfig();

    return [
      'enabled' => $this->biblioSettings->isEnabledForGo(),
      'baseUrl' => $this->biblioSettings->getBaseUrl(),
      'sdk' => $sdk_config === NULL ? NULL : [
        'applicationId' => $sdk_config['wedobooks-application-id'],
        'firebaseApiKey' => $sdk_config['wedobooks-firebase-api-key'],
        'firebaseProjectId' => $sdk_config['wedobooks-firebase-project-id'],
        'firebaseAppId' => $sdk_config['wedobooks-firebase-app-id'],
        'readerApiKey' => $sdk_config['wedobooks-reader-api-key'],
      ],
    ];
  }

}
