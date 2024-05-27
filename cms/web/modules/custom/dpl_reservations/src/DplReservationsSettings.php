<?php

namespace Drupal\dpl_reservations;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles reservations settings.
 */
class DplReservationsSettings extends DplReactConfigBase {
  const RESERVATIONS_LIST_SIZE_DESKTOP = 25;
  const RESERVATIONS_LIST_SIZE_MOBILE = 25;

  /**
   * Gets the configuration key for reservation settings.
   */
  public function getConfigKey(): string {
    return 'dpl_reservations.settings';
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(): array {
    return $this->legacyConfig();
  }

  /**
   * Get the desktop list size.
   *
   * @return string
   *   The desktop list size or the fallback value.
   */
  public function getListSizeDesktop(): string {
    return $this->loadConfig()->get('reservations_list_size_desktop') ?? self::RESERVATIONS_LIST_SIZE_DESKTOP;
  }

  /**
   * Get the mobile list size.
   *
   * @return string
   *   The mobile list size or the fallback value.
   */
  public function getListSizeMobile(): string {
    return $this->loadConfig()->get('reservations_list_size_mobile') ?? self::RESERVATIONS_LIST_SIZE_MOBILE;
  }

}
