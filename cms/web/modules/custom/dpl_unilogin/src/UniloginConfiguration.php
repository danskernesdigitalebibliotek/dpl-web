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
   * Get the Unilogin API Pubhub retailer key code.
   *
   * @return string|null
   *   The Unilogin API Pubhub retailer key code.
   */
  public function getUniloginApiPubhubRetailerKeyCode(): ?string {
    return $this->loadConfig()->get('unilogin_api_pubhub_retailer_key_code');
  }

}
