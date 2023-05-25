<?php

namespace Drupal\dpl_reservations;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles loans settings.
 */
class DplLoansSettings extends DplReactConfigBase {

  /**
   * Gets the configuration key for loans settings.
   */
  public function getConfigKey(): string {
    return 'dpl_loan_list.settings';
  }

}
