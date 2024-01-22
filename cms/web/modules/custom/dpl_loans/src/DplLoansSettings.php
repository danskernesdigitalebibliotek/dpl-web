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
    return 'dpl_loans.settings';
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
    return $this->loadConfig()->get('loan_list_size_desktop') ?? self::LOAN_LIST_SIZE_DESKTOP;
  }

  /**
   * Get the mobile list size.
   *
   * @return string
   *   The mobile list size or the fallback value.
   */
  public function getListSizeMobile(): string {
    return $this->loadConfig()->get('loan_list_size_mobile') ?? self::LOAN_LIST_SIZE_MOBILE;
  }

}
