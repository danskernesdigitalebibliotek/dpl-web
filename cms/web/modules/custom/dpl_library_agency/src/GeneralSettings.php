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
  // We define these urls so that the admins don't have to - e-reolen urls is
  // not expected to be changing often.
  const EREOLEN_MY_PAGE_URL = 'https://ereolen.dk/user/me';
  const EREOLEN_HOMEPAGE_URL = 'https://ereolen.dk';
  const FBI_PROFILE = 'next';
  const OPENING_HOURS_URL = '/branches';

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

  /**
   * Get configured FBI profiles.
   *
   * @return mixed[]
   *   Either saved profiles or default static ones.
   */
  public function getFbiProfiles(): array {
    return $this->loadConfig()->get('fbi_profiles') ?? [
      FbiProfileType::DEFAULT->value => self::FBI_PROFILE,
      FbiProfileType::LOCAL->value => self::FBI_PROFILE,
      FbiProfileType::GLOBAL->value => self::FBI_PROFILE,
    ];
  }

  /**
   * Get profile name.
   *
   * @param FbiProfileType $fbi_profile
   *   The FBI profile type.
   *
   * @return string
   *   The name of the requested profile context.
   */
  public function getFbiProfile(FbiProfileType $fbi_profile): string {
    $fbi_profiles = $this->getFbiProfiles();
    return $fbi_profiles[$fbi_profile->value];
  }

  /**
   * Get reservation relevant settings.
   *
   * @return mixed[]
   *   Array containing the urls.
   */
  public function getReservationDetails(): array {
    $allow_remove_ready_reservations = $this->loadConfig()->get('reservation_detail_allow_remove_ready_reservations')
      ?? self::RESERVATION_DETAIL_ALLOW_REMOVE_READY_RESERVATIONS;
    return [
      'allowRemoveReadyReservations' => $allow_remove_ready_reservations,
    ];
  }

  /**
   * Gets the default interest period as an array.
   *
   * @return string
   *   The default interest period array.
   */
  public function getPauseReservationInfoUrl(): string {
    return dpl_react_apps_format_app_url(
      $this->loadConfig()->get('pause_reservation_info_url'),
      self::PAUSE_RESERVATION_INFO_URL
    );
  }

}
