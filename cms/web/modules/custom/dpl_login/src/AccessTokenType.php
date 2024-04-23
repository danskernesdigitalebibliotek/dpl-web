<?php

namespace Drupal\dpl_login;

/**
 * Access token types enum.
 *
 * Used to distinguish between registered and unregistered users.
 */
enum AccessTokenType: string {
  case USER = 'user';
  case UNREGISTERED_USER = 'unregistered_user';
  case UNKNOWN = 'unknown';
}
