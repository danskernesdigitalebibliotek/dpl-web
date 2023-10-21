<?php

namespace Drupal\dpl_library_agency;

use Drupal\Core\Cache\CacheableDependencyInterface;
use Drupal\Core\Config\Config;
use Drupal\Core\Config\ConfigManagerInterface;

/**
 * Class that handles reservation settings for a library agency.
 */
class ReservationSettings implements CacheableDependencyInterface {

  const RESERVATION_SMS_NOTIFICATIONS_ENABLED = TRUE;

  /**
   * Constructs a new ReservationSettings object.
   */
  public function __construct(
    protected ConfigManagerInterface $configManager
  ) {}

  /**
   * Get the configuration entity containing reservation settings.
   */
  protected function getConfig(): Config {
    return $this->configManager->getConfigFactory()->get('dpl_library_agency.general_settings');
  }

  /**
   * Checks whether sms notifications for reservations are enabled.
   *
   * @return bool
   *   TRUE if sms notifications are enabled, FALSE otherwise.
   */
  public function smsNotificationsIsEnabled(): bool {
    $config = $this->getConfig();
    return $config->get('reservation_sms_notifications_enabled') ?? self::RESERVATION_SMS_NOTIFICATIONS_ENABLED;
  }

  /**
   * Sets whether sms notifications for reservations should be enabled.
   *
   * @param bool $enabled
   *   TRUE if sms notifications should be enabled, FALSE otherwise.
   */
  public function enableSmsNotifications(bool $enabled) : void {
    $this->getConfig()
      ->set('reservation_sms_notifications_enabled', $enabled)
      ->save();
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheContexts() : array {
    return $this->getConfig()->getCacheContexts();
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheTags() : array {
    return $this->getConfig()->getCacheTags();
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() : int {
    return $this->getConfig()->getCacheMaxAge();
  }

}
