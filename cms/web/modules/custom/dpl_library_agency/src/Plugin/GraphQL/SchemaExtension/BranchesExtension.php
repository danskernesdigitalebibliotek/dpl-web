<?php

namespace Drupal\dpl_library_agency\Plugin\GraphQL\SchemaExtension;

use Drupal\gsearch\AddressGsearchItemInterface;
use Drupal\dpl_library_agency\Branch\Branch;
use Drupal\dpl_library_agency\BranchSettings;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Branches extension.
 *
 * @SchemaExtension(
 *   id = "dpl_library_agency_branches",
 *   name = "Library agency branches extension",
 *   description = "Exposes library branches via GraphQL",
 *   schema = "graphql_compose"
 * )
 */
class BranchesExtension extends SdlSchemaExtensionPluginBase {

  /**
   * The branch settings service.
   */
  protected BranchSettings $branchSettings;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static {
    $instance = parent::create($container, $configuration, $plugin_id, $plugin_definition);
    $instance->branchSettings = $container->get(BranchSettings::class);
    return $instance;
  }

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry): void {
    $builder = new ResolverBuilder();

    $registry->addFieldResolver('Query', 'getBranches',
      $builder->produce('get_branches_producer')
        ->map('isilId', $builder->fromArgument('isilId'))
        ->map('availabilityContexts', $builder->fromArgument('availabilityContexts'))
        ->map('cmsConfigured', $builder->fromArgument('cmsConfigured'))
    );

    // Singular lookup. Filters the same producer by isilId then picks the
    // first (and only) match. Returns NULL when no branch is found.
    $registry->addFieldResolver('Query', 'getBranch',
      $builder->compose(
        $builder->produce('get_branches_producer')
          ->map('isilId', $builder->fromArgument('isilId'))
          ->map('availabilityContexts', $builder->fromValue(NULL))
          ->map('cmsConfigured', $builder->fromValue(NULL)),
        $builder->callback(fn(array $branches): ?Branch => $branches[0] ?? NULL)
      )
    );

    $registry->addFieldResolver('Branch', 'isilId',
      $builder->callback(fn(Branch $branch) => $branch->id)
    );

    $registry->addFieldResolver('Branch', 'title',
      $builder->callback(fn(Branch $branch) => $branch->title)
    );

    $registry->addFieldResolver('Branch', 'address',
      $builder->callback(function (Branch $branch): ?array {
        $addressData = $branch->getAddressData();
        if ($addressData === NULL) {
          return NULL;
        }

        return $this->constructBranchAddress($addressData);
      })
    );

    $registry->addFieldResolver('Branch', 'phone',
      $builder->callback(function (Branch $branch): ?string {
        $node = $branch->getNode();
        if (!$node || !$node->hasField('field_phone') || $node->get('field_phone')->isEmpty()) {
          return NULL;
        }
        return $node->get('field_phone')->value;
      })
    );

    $registry->addFieldResolver('Branch', 'email',
      $builder->callback(function (Branch $branch): ?string {
        $node = $branch->getNode();
        if (!$node || !$node->hasField('field_email') || $node->get('field_email')->isEmpty()) {
          return NULL;
        }
        return $node->get('field_email')->value;
      })
    );

    $registry->addFieldResolver('Branch', 'availabilityContext',
      $builder->callback(function (Branch $branch): array {
        return [
          'search' => !in_array($branch->id, $this->branchSettings->getExcludedSearchBranches(), TRUE),
          'availability' => !in_array($branch->id, $this->branchSettings->getExcludedAvailabilityBranches(), TRUE),
          'reservations' => !in_array($branch->id, $this->branchSettings->getExcludedReservationBranches(), TRUE),
        ];
      })
    );

    $registry->addFieldResolver('BranchAddress', 'street',
      $builder->callback(fn(array $address) => $address['address'])
    );

    $registry->addFieldResolver('BranchAddress', 'postalCode',
      $builder->callback(fn(array $address) => $address['postal_code'])
    );

    $registry->addFieldResolver('BranchAddress', 'city',
      $builder->callback(fn(array $address) => $address['city'])
    );

    $registry->addFieldResolver('BranchAddress', 'country',
      $builder->callback(fn(array $address) => $address['country'])
    );

    $registry->addFieldResolver('BranchAvailabilityContext', 'search',
      $builder->callback(fn(array $context) => $context['search'])
    );

    $registry->addFieldResolver('BranchAvailabilityContext', 'availability',
      $builder->callback(fn(array $context) => $context['availability'])
    );

    $registry->addFieldResolver('BranchAvailabilityContext', 'reservations',
      $builder->callback(fn(array $context) => $context['reservations'])
    );
  }

  /**
   * Constructs the address for a branch.
   *
   * @return array{
   *   postal_code: string|null,
   *   city: string|null,
   *   address: string|null,
   *   country: string
   *   }
   */
  protected function constructBranchAddress(AddressGsearchItemInterface $item): array {
    return [
      'postal_code' => $item->getPostalCode(),
      'city' => $item->getPostalName(),
      'address' => $item->getAddress(),
      'country' => 'DK',
    ];
  }

}
