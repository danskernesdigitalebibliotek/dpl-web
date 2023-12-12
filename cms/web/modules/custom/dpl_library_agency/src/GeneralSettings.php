<?php

namespace Drupal\dpl_library_agency;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles general settings.
 */
class GeneralSettings extends DplReactConfigBase {

  const EXPIRATION_WARNING_DAYS_BEFORE_CONFIG = 6;
  const RESERVATION_DETAIL_ALLOW_REMOVE_READY_RESERVATIONS = FALSE;
  const INTEREST_PERIODS_CONFIG = '180-6 måneder';
  const DEFAULT_INTEREST_PERIOD_CONFIG = [
    "value" => "180",
    "label" => "6 måneder",
  ];
  const RESERVATION_SMS_NOTIFICATIONS_ENABLED = TRUE;
  const PAUSE_RESERVATION_INFO_URL = '';
  const REDIRECT_ON_BLOCKED_URL = '';
  const BLOCKED_PATRON_E_LINK_URL = '';
  // We define these urls so that the admins don't have to - e-reolen urls is
  // not expected to be changing often.
  const EREOLEN_MY_PAGE_URL = 'https://ereolen.dk/user/me';
  const EREOLEN_HOMEPAGE_URL = 'https://ereolen.dk';
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
    return $this->loadConfig()->get();
  }

  /**
   * Get the interestPeriodConfiguration.
   *
   * @return mixed[]
   *   Array containing the collected interestPeriodConfiguration.
   */
  public function getInterestPeriodsConfig(): array {
    $interest_periods = self::getInterestPeriods();
    $default_interest_period = self::getDefaultInterestPeriod($interest_periods);

    $interest_periods_config['interestPeriods'] = [];
    foreach ($interest_periods as $key => $value) {
      $interest_periods_config['interestPeriods'][] = [
        'value' => $key,
        'label' => $value,
      ];
    }

    $interest_periods_config['defaultInterestPeriod'] = $default_interest_period;

    return $interest_periods_config;
  }

  /**
   * Gets interest periods as an array.
   *
   * @return mixed[]
   *   The interest period array.
   */
  public function getInterestPeriods(): array {
    $interest_periods = [];
    $options = explode(PHP_EOL, $this->loadConfig()->get('interest_periods_config'));
    foreach ($options as $option) {
      $interest_periods += self::splitInterestPeriodString($option);
    }
    return $interest_periods;
  }

  /**
   * Gets the default interest period as an array.
   *
   * @param mixed[] $interest_periods
   *   The interestPeriods as an array.
   *
   * @return mixed[]
   *   The default interest period array.
   */
  protected function getDefaultInterestPeriod(array $interest_periods): array {
    $default_interest_period_value = $this->loadConfig()->get('default_interest_period_config');

    return [
      'value' => $default_interest_period_value,
      'label' => $interest_periods[$default_interest_period_value],
    ];
  }

  /**
   * Splits interest periods strings into array.
   *
   * @param string $period
   *   The interest period string to be split.
   *
   * @return mixed[]
   *   The interest period after being split into array.
   */
  public static function splitInterestPeriodString(string $period): array {
    [$days, $label] = explode('-', $period);
    $interest_periods[trim($days)] = trim($label);

    return $interest_periods;
  }

}
