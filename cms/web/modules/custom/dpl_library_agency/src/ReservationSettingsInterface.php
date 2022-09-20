<?php

namespace Drupal\dpl_library_agency;

/**
 * Interface for the ReservationSettings class.
 */
interface ReservationSettingsInterface {

  /**
   * Tells if sms notifications are enabled for patrons.
   *
   * @return bool
   *   TRUE if sms notifications are enabled, FALSE otherwise.
   */
  public function smsNotificationsIsEnabled(): bool;

}
