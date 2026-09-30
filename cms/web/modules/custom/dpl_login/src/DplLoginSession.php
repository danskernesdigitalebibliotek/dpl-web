<?php

declare(strict_types=1);

namespace Drupal\dpl_login;

use Symfony\Component\HttpFoundation\Session\SessionInterface;

/**
 * Session wrapper for DPL login-specific state.
 */
class DplLoginSession {

  private const KEY_AUTHENTICATION_TYPE = 'dpl_login_authentication_type';
  private const KEY_UNILOGIN_LOGIN = 'dpl_login_unilogin_login';

  public function __construct(private SessionInterface $session) {}

  /**
   * Set the current authentication type.
   */
  public function setAuthenticationType(AuthenticationType $type): void {
    $this->session->set(self::KEY_AUTHENTICATION_TYPE, $type->value);
  }

  /**
   * Get the current authentication type.
   */
  public function getAuthenticationType(): ?AuthenticationType {
    $value = $this->session->get(self::KEY_AUTHENTICATION_TYPE);

    if (empty($value)) {
      return NULL;
    }

    return AuthenticationType::tryFrom($value);
  }

  /**
   * Clear all DPL login session data.
   */
  public function deletetAuthenticationType(): void {
    $this->session->remove(self::KEY_AUTHENTICATION_TYPE);
  }

  /**
   * Set whether the current login was started as a Unilogin login.
   */
  public function setUniloginLogin(bool $unilogin): void {
    $this->session->set(self::KEY_UNILOGIN_LOGIN, $unilogin);
  }

  /**
   * Was the current login started as a Unilogin login?
   */
  public function isUniloginLogin(): bool {
    return (bool) $this->session->get(self::KEY_UNILOGIN_LOGIN, FALSE);
  }

  /**
   * Clear the Unilogin login flag.
   */
  public function deleteUniloginLogin(): void {
    $this->session->remove(self::KEY_UNILOGIN_LOGIN);
  }

}
