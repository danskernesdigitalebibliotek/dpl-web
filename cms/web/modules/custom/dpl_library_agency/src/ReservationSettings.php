<?php

namespace Drupal\dpl_library_agency;

use Drupal\Core\Config\ConfigManagerInterface;

/**
 * Class that handles reservation settings for a library agency.
 */
class ReservationSettings implements ReservationSettingsInterface {

  /**
   * Drupal\Core\Config\ConfigManagerInterface definition.
   *
   * @var \Drupal\Core\Config\ConfigManagerInterface
   */
  protected $configManager;

  /**
   * Constructs a new ReservationSettings object.
   */
  public function __construct(ConfigManagerInterface $config_manager) {
    $this->configManager = $config_manager;
  }

  /**
   * Checks wether sms notifications for reservations are enabled.
   *
   * @return bool
   *   TRUE if sms notifications are enabled, FALSE otherwise.
   */
  public function smsNotificationsIsEnabled(): bool {
    $config = $this->configManager->getConfigFactory()->get('dpl_library_agency.general_settings');
    if ($config->get('reservation_sms_notifications_disabled')) {
      return FALSE;
    }
    return TRUE;
  }

  /**
   * Returns cache tags that is touched.
   *
   * The cache tags are related to sms notification settings.
   *
   * @return string[]
   *   An array of cache tags.
   */
  public static function getCacheTagsSmsNotificationsIsEnabled(): array {
    return ['dpl_react_app:material'];
  }

}
