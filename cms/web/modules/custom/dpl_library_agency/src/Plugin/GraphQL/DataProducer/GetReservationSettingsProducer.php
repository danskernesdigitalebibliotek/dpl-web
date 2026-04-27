<?php

namespace Drupal\dpl_library_agency\Plugin\GraphQL\DataProducer;

use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_library_agency\GeneralSettings;
use Drupal\dpl_library_agency\ReservationSettings;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Resolves reservation settings for the library.
 *
 * @DataProducer(
 *   id = "get_reservation_settings_producer",
 *   name = "Get Reservation Settings Producer",
 *   description = "Provides reservation settings.",
 *   produces = @ContextDefinition("any",
 *     label = "Reservation Settings"
 *   )
 * )
 */
class GetReservationSettingsProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected ReservationSettings $reservationSettings,
    protected GeneralSettings $generalSettings,
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
      $container->get(ReservationSettings::class),
      $container->get(GeneralSettings::class),
    );
  }

  /**
   * Resolves the reservation settings.
   *
   * @param \Drupal\graphql\GraphQL\Execution\FieldContext $field_context
   *   The field context for adding cache metadata.
   *
   * @return array<string, mixed>
   *   The reservation settings.
   */
  public function resolve(FieldContext $field_context): array {
    $field_context->addCacheableDependency($this->reservationSettings);
    $field_context->addCacheableDependency($this->generalSettings);

    $interest_periods_config = $this->generalSettings->getInterestPeriodsConfig();
    $reservation_details = $this->generalSettings->getReservationDetails();

    return [
      'smsNotificationsEnabled' => $this->reservationSettings->smsNotificationsIsEnabled(),
      'interestPeriods' => [
        'all' => $interest_periods_config['interestPeriods'],
        'default' => $interest_periods_config['defaultInterestPeriod'],
      ],
      'allowRemoveReadyReservations' => $reservation_details['allowRemoveReadyReservations'],
      'urls' => [
        'pauseReservationInfo' => $this->generalSettings->getPauseReservationInfoUrl(),
        'zeroHitsSearch' => $this->generalSettings->getZeroHitsSearchUrl(),
      ],
    ];
  }

}
