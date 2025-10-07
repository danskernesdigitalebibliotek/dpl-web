<?php

declare(strict_types=1);

namespace Drupal\dpl_login;

/**
 * Service to provide access to user.module functions.
 *
 * Function calls is no fun i tests, so we use this service so other services
 * can just depend on it, and it's easily mockable in tests.
 */
class User {

  /**
   * Call user_logout().
   */
  public function logout(): void {
    user_logout();
  }

}
