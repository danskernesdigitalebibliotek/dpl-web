<?php

declare(strict_types=1);

namespace Drupal\dpl_login;

use Symfony\Component\HttpFoundation\Session\SessionInterface;

/**
 * Session wrapper for DPL login-specific state.
 */
class DplLoginSession {

  private const KEY_AUTHENTICATION_TYPE = 'dpl_login_authentication_type';

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

}
