<?php

declare(strict_types=1);

namespace Drupal\dpl_login;

use Symfony\Component\HttpFoundation\Session\SessionInterface;

/**
 * Remembers how a login was started, until it comes back.
 *
 * A login leaves the site: the browser goes to Adgangsplatformen and comes
 * back in a later request to the openid_connect callback, where the
 * dpl_login hooks (pre_authorize, post_authorize, userinfo_save) handle the
 * result. Those hooks need to know how the login was started, so that is
 * stored in the Drupal session in between:
 *
 * - The authentication type. The /login route starts a normal login and
 *   patron registration starts a registration. After login, an unregistered
 *   user is only told "You are not registered at this library" for a normal
 *   login, since a registration expects exactly that user.
 * - Whether the login was started as a Unilogin login (/login?idp=unilogin).
 *   Unilogin users are recognised by the claims Adgangsplatformen returns;
 *   this flag is the fallback if the claims do not say so.
 *
 * Both values are cleared when the login has been handled, or denied, so
 * they cannot affect the next login.
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
