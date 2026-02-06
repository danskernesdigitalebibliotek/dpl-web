<?php

namespace Drupal\dpl_patron_reg;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles patron registration settings.
 */
class DplPatronRegSettings extends DplReactConfigBase {

  const AGE_LIMIT = '18';
  const PATRON_REGISTRATION_PAGE_URL = '';
  const REDIRECT_ON_USER_CREATED_URL = '';

  /**
   * Gets the configuration key for the instant patron registration settings.
   */
  public function getConfigKey(): string {
    return 'dpl_patron_reg.settings';
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(): array {
    return $this->legacyConfig();
  }

  /**
   * Get the patron registration url.
   *
   * @return string
   *   The fees and replacement cost url or the fallback value.
   */
  public function getPatronRegistrationPageUrl(): string {
    return dpl_react_apps_format_app_url($this->loadConfig()->get('patron_registration_page_url'), self::PATRON_REGISTRATION_PAGE_URL);
  }

}
