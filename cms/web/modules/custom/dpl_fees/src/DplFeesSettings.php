<?php

namespace Drupal\dpl_fees;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles instant loan settings.
 */
class DplFeesSettings extends DplReactConfigBase {
  const FEES_AND_REPLACEMENT_COSTS_URL = '';
  const PAYMENT_OVERVIEW_URL = '';
  const FEE_LIST_BODY_TEXT = '';
  const PAGE_SIZE_DESKTOP = 25;
  const PAGE_SIZE_MOBILE = 25;

  /**
   * Gets the configuration key for the instant loan settings.
   */
  public function getConfigKey(): string {
    return 'dpl_fees.settings';
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(): array {
    return $this->legacyConfig();
  }

  /**
   * Get the getViewFeesAndCompensationRates url.
   *
   * @return string
   *   The url.
   */
  public function getViewFeesAndCompensationRatesUrl(): string {
    return $this->loadConfig()
      ->get('fees_and_replacement_costs_url')
      ?? self::FEES_AND_REPLACEMENT_COSTS_URL;
  }

}
