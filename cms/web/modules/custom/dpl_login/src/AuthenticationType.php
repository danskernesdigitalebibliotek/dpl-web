<?php

declare(strict_types=1);

namespace Drupal\dpl_login;

/**
 * Authentication type for DPL login flows.
 */
enum AuthenticationType: string {

  case Login = 'login';
  case Registration = 'registration';

}
