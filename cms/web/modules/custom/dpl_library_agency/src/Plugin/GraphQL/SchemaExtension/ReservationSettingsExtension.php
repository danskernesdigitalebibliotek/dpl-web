<?php

namespace Drupal\dpl_library_agency\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;

/**
 * Reservation settings extension.
 *
 * @SchemaExtension(
 *   id = "dpl_library_agency_reservation_settings",
 *   name = "Library agency reservation settings extension",
 *   description = "Exposes reservation settings via GraphQL",
 *   schema = "graphql_compose"
 * )
 */
class ReservationSettingsExtension extends SdlSchemaExtensionPluginBase {

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry): void {
    $builder = new ResolverBuilder();

    $registry->addFieldResolver('Query', 'reservationSettings',
      $builder->produce('get_reservation_settings_producer')
    );

    $registry->addFieldResolver('ReservationSettings', 'smsNotificationsEnabled',
      $builder->callback(fn(array $settings) => $settings['smsNotificationsEnabled'])
    );

    $registry->addFieldResolver('ReservationSettings', 'interestPeriods',
      $builder->callback(fn(array $settings) => $settings['interestPeriods'])
    );

    $registry->addFieldResolver('InterestPeriods', 'all',
      $builder->callback(fn(array $periods) => $periods['all'])
    );

    $registry->addFieldResolver('InterestPeriods', 'default',
      $builder->callback(fn(array $periods) => $periods['default'])
    );

    $registry->addFieldResolver('ReservationSettings', 'allowRemoveReadyReservations',
      $builder->callback(fn(array $settings) => $settings['allowRemoveReadyReservations'])
    );

    $registry->addFieldResolver('ReservationSettings', 'urls',
      $builder->callback(fn(array $settings) => $settings['urls'])
    );

    $registry->addFieldResolver('ReservationUrls', 'pauseReservationInfo',
      $builder->callback(fn(array $urls) => $urls['pauseReservationInfo'])
    );

    $registry->addFieldResolver('ReservationUrls', 'zeroHitsSearch',
      $builder->callback(fn(array $urls) => $urls['zeroHitsSearch'])
    );

    $registry->addFieldResolver('InterestPeriod', 'value',
      $builder->callback(fn(array $period) => (int) $period['value'])
    );

    $registry->addFieldResolver('InterestPeriod', 'label',
      $builder->callback(fn(array $period) => $period['label'])
    );
  }

}
