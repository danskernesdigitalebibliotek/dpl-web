<?php

namespace Drupal\dpl_unilogin;

use Drupal\dpl_react\DplReactConfigBase;

/**
 * Class that handles UniLogin configuration settings.
 */
class UniloginConfiguration extends DplReactConfigBase {
  const UNILOGIN_API_ENDPOINT = 'https://et-broker.unilogin.dk';
  const UNILOGIN_API_WELLKNOWN_ENDPOINT = 'https://et-broker.unilogin.dk/auth/realms/broker/.well-known/openid-configuration';
  const UNILOGIN_API_CLIENT_ID = 'abc';
  const UNILOGIN_API_CLIENT_SECRET = 'abc';

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
   * Get the UniLogin API endpoint.
   *
   * @return string
   *   The UniLogin API endpoint.
   */
  public function getUniloginApiEndpoint(): string {
    return $this->loadConfig()->get('unilogin_api_endpoint') ?? self::UNILOGIN_API_ENDPOINT;
  }

  /**
   * Get the UniLogin API wellknown endpoint.
   *
   * @return string
   *   The UniLogin API wellknown endpoint.
   */
  public function getUniloginApiWellknownEndpoint(): string {
    return $this->loadConfig()->get('unilogin_api_wellknown_endpoint') ?? self::UNILOGIN_API_WELLKNOWN_ENDPOINT;
  }

  /**
   * Get the UniLogin API client ID.
   *
   * @return string
   *   The UniLogin API client ID.
   */
  public function getUniloginApiClientId(): string {
    return $this->loadConfig()->get('unilogin_api_client_id') ?? self::UNILOGIN_API_CLIENT_ID;
  }

  /**
   * Get the UniLogin API client secret.
   *
   * @return string
   *   The UniLogin API client secret.
   */
  public function getUniloginApiClientSecret(): string {
    return $this->loadConfig()->get('unilogin_api_client_secret') ?? self::UNILOGIN_API_CLIENT_SECRET;
  }

}
