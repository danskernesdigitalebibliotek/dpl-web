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
  const FEES_LIST_SIZE_DESKTOP = 25;
  const FEES_LIST_SIZE_MOBILE = 25;

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

  /**
   * Get the desktop list size.
   *
   * @return string
   *   The desktop list size or the fallback value.
   */
  public function getListSizeDesktop(): string {
    return $this->loadConfig()->get('fees_list_size_desktop') ?? self::FEES_LIST_SIZE_DESKTOP;
  }

  /**
   * Get the mobile list size.
   *
   * @return string
   *   The mobile list size or the fallback value.
   */
  public function getListSizeMobile(): string {
    return $this->loadConfig()->get('fees_list_size_mobile') ?? self::FEES_LIST_SIZE_MOBILE;
  }

}
