<?php

namespace Drupal\dpl_loans;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles loans settings.
 */
class DplLoansSettings extends DplReactConfigBase {
  const LOAN_LIST_SIZE_DESKTOP = 25;
  const LOAN_LIST_SIZE_MOBILE = 25;

  /**
   * Gets the configuration key for loans settings.
   */
  public function getConfigKey(): string {
    return 'dpl_loan_list.settings';
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(): array {
    return $this->legacyConfig();
  }

}
