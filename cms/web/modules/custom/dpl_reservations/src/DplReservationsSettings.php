<?php

namespace Drupal\dpl_reservations;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles reservations settings.
 */
class DplReservationsSettings extends DplReactConfigBase {
  const PAGE_SIZE_DESKTOP = 25;
  const PAGE_SIZE_MOBILE = 25;

  /**
   * Gets the configuration key for reservation settings.
   */
  public function getConfigKey(): string {
    return 'dpl_reservation_list.settings';
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(): array {
    return $this->legacyConfig();
  }

}
