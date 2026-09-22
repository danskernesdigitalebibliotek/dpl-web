<?php

namespace Drupal\dpl_go\Plugin\GraphQL\DataProducer;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_library_agency\ReservationSettings;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Resolves whether SMS notifications for reservations are enabled.
 *
 * @DataProducer(
 *   id = "sms_notifications_enabled_producer",
 *   name = "SMS Notifications Enabled Producer",
 *   description = "Provides whether SMS notifications are enabled.",
 *   produces = @ContextDefinition("any",
 *     label = "Request Response"
 *   )
 * )
 */
class SmsNotificationsEnabledProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected ReservationSettings $reservationSettings,
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
    );
  }

  /**
   * Resolves whether SMS notifications for reservations are enabled.
   *
   * @return bool
   *   TRUE if SMS notifications are enabled, FALSE otherwise.
   */
  public function resolve(FieldContext $field_context): bool {
    $field_context->addCacheableDependency((new CacheableMetadata())->addCacheTags($this->reservationSettings->getCacheTags()));

    return $this->reservationSettings->smsNotificationsIsEnabled();
  }

}
