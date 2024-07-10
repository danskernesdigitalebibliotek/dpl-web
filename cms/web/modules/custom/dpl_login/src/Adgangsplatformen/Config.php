<?php

namespace Drupal\dpl_login\Adgangsplatformen;

use Drupal\dpl_login\Exception\MissingConfigurationException;
use Drupal\dpl_react\DplReactConfigBase;
use function Safe\sprintf as sprintf;

/**
 * Structured access to configuration for Adgangsplatformen.
 *
 * Adgangsplatformen is implemented as a plugin for the OpenID Connect Drupal
 * module but we need access to the stored values elsewhere in the system.
 * This class provides structured access to what would otherwise be an map
 * of strings.
 */
class Config extends DplReactConfigBase {

  /**
   * The Drupal configuration key under which the config is stored.
   */
  const CONFIG_KEY = "openid_connect.settings.adgangsplatformen";

  /**
   * Get a specific configuration value.
   *
   * @throws \Drupal\dpl_login\Exception\MissingConfigurationException
   */
  private function getValue(string $key) : string {
    $settings = $this->getConfig();
    $setting = $settings[$key] ?? '';
    // Assume that the Adgangsplatformen configuration should always be set so
    // throw exception instead of returning a nullable or empty string.
    // @see dpl_login_requirements().
    return ($setting) ? $setting : throw new MissingConfigurationException(
      sprintf('Adgangsplatformen plugin config variable %s is missing', $key)
    );
  }

  /**
   * Get the agency id of the current library.
   *
   * Agency ids are also known as ISIL numbers. If this is the only value you
   * need from the configuration then you should use the following class.
   *
   * @see LibraryAgencyIdProvider
   *
   * @throws \Drupal\dpl_login\Exception\MissingConfigurationException
   */
  public function getAgencyId(): string {
    return $this->getValue('agency_id');

  }

  /**
   * Get the url where browsers should be redirected to when logging out.
   *
   * @throws \Drupal\dpl_login\Exception\MissingConfigurationException
   */
  public function getLogoutEndpoint(): string {
    return $this->getValue('logout_endpoint');
  }

  /**
   * Get the url where a client can retrieve an OAuth access token.
   *
   * @throws \Drupal\dpl_login\Exception\MissingConfigurationException
   */
  public function getTokenEndpoint(): string {
    return $this->getValue('token_endpoint');
  }

  /**
   * Get the client id to use when accessing Adgangsplatformen.
   *
   * @throws \Drupal\dpl_login\Exception\MissingConfigurationException
   */
  public function getClientId(): string {
    return $this->getValue('client_id');
  }

  /**
   * Get the client secret to use when accessing Adgangsplatformen.
   *
   * @throws \Drupal\dpl_login\Exception\MissingConfigurationException
   */
  public function getClientSecret(): string {
    return $this->getValue('client_secret');
  }

  /**
   * {@inheritDoc}
   */
  public function getConfig(): array {
    $settings = $this->configManager->getConfigFactory()->get(self::CONFIG_KEY)->get('settings');
    // Do not throw an exception here even if configuration is missing. Errors
    // are handled is passed to the OpenID Connect plugin.
    return (is_array($settings)) ? $settings : [];
  }

  /**
   * {@inheritDoc}
   */
  public function getConfigKey(): string {
    return self::CONFIG_KEY;
  }

}
