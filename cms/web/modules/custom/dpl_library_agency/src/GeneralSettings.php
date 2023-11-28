<?php

namespace Drupal\dpl_library_agency;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles general settings.
 */
class GeneralSettings extends DplReactConfigBase {

  const EXPIRATION_WARNING_DAYS_BEFORE_CONFIG = 6;
  const RESERVATION_DETAIL_ALLOW_REMOVE_READY_RESERVATIONS = FALSE;
  const INTEREST_PERIODS_CONFIG = '180-6 months';
  const DEFAULT_INTEREST_PERIOD_CONFIG = [
    "value" => "180",
    "label" => "6 months",
  ];
  const RESERVATION_SMS_NOTIFICATIONS_ENABLED = TRUE;
  const PAUSE_RESERVATION_INFO_URL = '';
  const BLOCKED_PATRON_E_LINK_URL = '';
  const EREOLEN_MY_PAGE_URL = '';
  const EREOLEN_HOMEPAGE_URL = '';
  const PAUSE_RESERVATION_START_DATE_CONFIG = '';

  /**
   * Gets the configuration key for general settings.
   */
  public function getConfigKey(): string {
    return 'dpl_library_agency.general_settings';
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(): array {
    return $this->legacyConfig();
  }

  /**
   * Get the interestPeriodConfiguration.
   *
   * @return array[]
   *   Array containing the collected interestPeriodConfiguration.
   */
  public function getInterestPeriodsConfig(): array {
    $interestPeriods = self::getInterestPeriodsAsArray() ?? self::INTEREST_PERIODS_CONFIG;
    $defaultInterestPeriod = self::getDefaultInterestPeriodAsArray($interestPeriods) ?? self::DEFAULT_INTEREST_PERIOD_CONFIG;

    $interestPeriodsConfig['interestPeriods'] = [];
    foreach ($interestPeriods as $key => $value) {
      $interestPeriodsConfig['interestPeriods'][] = [
        'value' => $key,
        'label' => $value,
      ];
    }

    $interestPeriodsConfig['defaultInterestPeriod'] = $defaultInterestPeriod;

    return $interestPeriodsConfig;
  }

  /**
   * Gets interest periods as an array.
   *
   * @return array
   *   The interest period array.
   */
  public function getInterestPeriodsAsArray(): array {
    $interestPeriods = $this->loadConfig()->get('interest_periods_config');

    $interestPeriodsArray = [];
    $optionsArray = explode(PHP_EOL, $interestPeriods);
    foreach ($optionsArray as $option) {
      list($days, $label) = explode('-', $option);
      $interestPeriodsArray[trim($days)] = trim($label);
    }
    return $interestPeriodsArray;
  }

  /**
   * Gets the default interest period as an array.
   *
   * @param array[] $interestPeriods
   *   The interestPeriods as an array.
   *
   * @return array[]
   *   The default interest period array.
   */
  protected function getDefaultInterestPeriodAsArray(array $interestPeriods): array {
    $defaultInterestPeriodValue = $this->loadConfig()->get('default_interest_period_config');

    return [
      'value' => $defaultInterestPeriodValue,
      'label' => $interestPeriods[$defaultInterestPeriodValue],
    ];
  }

}
