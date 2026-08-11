<?php

namespace Drupal\dpl_go\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Resolves the branches excluded from availability calculations.
 *
 * @DataProducer(
 *   id = "blacklisted_availability_branches_producer",
 *   name = "Blacklisted Availability Branches Producer",
 *   description = "Provides branches excluded from availability.",
 *   produces = @ContextDefinition("any",
 *     label = "Request Response"
 *   )
 * )
 */
class BlacklistedAvailabilityBranchesProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected BranchSettings $branchSettings,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): self {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get(BranchSettings::class),
    );
  }

  /**
   * Resolves the branches excluded from availability calculations.
   *
   * @return string[]
   *   The ids of the branches excluded from availability calculations.
   */
  public function resolve(FieldContext $field_context): array {
    $field_context->addCacheableDependency(
      (new CacheableMetadata())->addCacheTags($this->branchSettings->getCacheTags())
    );

    return $this->branchSettings->getExcludedAvailabilityBranches();
  }

}
