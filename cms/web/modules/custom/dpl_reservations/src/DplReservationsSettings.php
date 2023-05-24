<?php

namespace Drupal\dpl_reservations;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles reservations settings.
 */
class DplReservationsSettings extends DplReactConfigBase {

  /**
   * Gets the configuration key for reservation settings.
   */
  public function getConfigKey(): string {
    return 'dpl_reservation_list.settings';
  }

}
