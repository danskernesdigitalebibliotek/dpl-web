<?php

namespace Drupal\dpl_instant_loan;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles instant loan settings.
 */
class DplInstantLoanSettings extends DplReactConfigBase {

  /**
   * Gets the configuration key for the instant loan settings.
   */
  public function getConfigKey(): string {
    return 'dpl_instant_loan.settings';
  }

}
