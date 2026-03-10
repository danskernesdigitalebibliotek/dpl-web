<?php

namespace Drupal\dpl_library_agency\Plugin\GraphQL\DataProducer;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_library_agency\Branch\Branch;
use Drupal\dpl_library_agency\Branch\BranchRepositoryInterface;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Resolves branches for the library.
 *
 * @DataProducer(
 *   id = "get_branches_producer",
 *   name = "Get Branches Producer",
 *   description = "Provides library branches with optional filtering.",
 *   produces = @ContextDefinition("any",
 *     label = "Branches"
 *   ),
 *   consumes = {
 *     "isilId" = @ContextDefinition("string",
 *       label = "ISIL Branch ID filter",
 *       required = false
 *     ),
 *     "availabilityContexts" = @ContextDefinition("any",
 *       label = "Available in (search, availability, reservations)",
 *       required = false
 *     ),
 *     "cmsConfigured" = @ContextDefinition("any",
 *       label = "Filter to only branches that have a corresponding CMS node",
 *       required = false
 *     )
 *   }
 * )
 */
class GetBranchesProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected BranchRepositoryInterface $branchRepository,
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
      $container->get(BranchRepositoryInterface::class),
      $container->get(BranchSettings::class),
    );
  }

  /**
   * Resolves the branches.
   *
   * @param string|null $isilId
   *   Optional ISIL branch ID to filter by.
   * @param string[]|null $availabilityContexts
   *   Optional whitelist types to filter by. Accepted values: "search",
   *   "availability", "reservations". Multiple values use AND logic — only
   *   branches whitelisted for every specified purpose are returned.
   * @param bool|null $cmsConfigured
   *   Optional filter to only return branches that have a corresponding CMS
   *   node. When TRUE, only CMS-configured branches are returned. When FALSE,
   *   only branches without CMS configuration are returned.
   * @param \Drupal\graphql\GraphQL\Execution\FieldContext $field_context
   *   The field context for adding cache metadata.
   *
   * @return \Drupal\dpl_library_agency\Branch\Branch[]
   *   The filtered branches.
   */
  public function resolve(
    ?string $isilId,
    ?array $availabilityContexts,
    mixed $cmsConfigured,
    FieldContext $field_context,
  ): array {
    $field_context->addCacheableDependency($this->branchRepository);
    $field_context->addCacheableDependency($this->branchSettings);

    $branches = $this->branchRepository->getBranches();
    if ($isilId !== NULL) {
      $branches = array_filter(
        $branches,
        fn(Branch $branch) => $branch->id === $isilId
      );
    }

    if (!empty($availabilityContexts)) {
      foreach ($availabilityContexts as $availabilityContext) {
        $excludedBranchIds = match ($availabilityContext) {
          'search' => $this->branchSettings->getExcludedSearchBranches(),
          'availability' => $this->branchSettings->getExcludedAvailabilityBranches(),
          'reservations' => $this->branchSettings->getExcludedReservationBranches(),
          default => [],
        };

        $branches = array_filter(
          $branches,
          fn(Branch $branch) => !in_array($branch->id, $excludedBranchIds, TRUE)
        );
      }
    }

    if ($cmsConfigured !== NULL) {
      $branches = array_filter(
        $branches,
        fn(Branch $branch) => (bool) $branch->getNode() === (bool) $cmsConfigured
      );
    }

    return array_values($branches);
  }

}
