<?php

namespace Drupal\dpl_unilogin;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles Unilogin configuration settings.
 */
class UniloginConfiguration extends DplReactConfigBase {

  /**
   * The Drupal configuration key under which the config is stored.
   */
  const CONFIG_KEY = "dpl_unilogin.settings";

  /**
   * {@inheritdoc}
   */
  public function getConfig(): array {
    return $this->loadConfig()->get();
  }

  /**
   * {@inheritDoc}
   */
  public function getConfigKey(): string {
    return self::CONFIG_KEY;
  }

  /**
   * Get the Unilogin API client secret.
   *
   * @return string|null
   *   The Unilogin API client secret.
   */
  public function getUniloginApiClientSecret(): ?string {
    return $this->loadConfig()->get('unilogin_api_client_secret');
  }

  /**
   * Get the Unilogin API municipality ID.
   *
   * @return string|null
   *   The Unilogin API municipality ID.
   */
  public function getUniloginApiMunicipalityId(): ?string {
    return $this->loadConfig()->get('unilogin_api_municipality_id');
  }

  /**
   * Get the Unilogin API webservice username.
   *
   * @return string|null
   *   The Unilogin API webservice username.
   */
  public function getUniloginApiWebServiceUsername(): ?string {
    return $this->loadConfig()->get('unilogin_api_webservice_user_name');
  }

  /**
   * Get the Unilogin API webservice password.
   *
   * @return string|null
   *   The Unilogin API webservice password.
   */
  public function getUniloginApiWebServicePassword(): ?string {
    return $this->loadConfig()->get('unilogin_api_webservice_password');
  }

  /**
   * Get the Unilogin API Pubhub retailer key code.
   *
   * @return string|null
   *   The Unilogin API Pubhub retailer key code.
   */
  public function getUniloginApiPubhubRetailerKeyCode(): ?string {
    return $this->loadConfig()->get('unilogin_api_pubhub_retailer_key_code');
  }

}
