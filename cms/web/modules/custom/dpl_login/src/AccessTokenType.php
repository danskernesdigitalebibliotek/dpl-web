<?php

namespace Drupal\dpl_login;

/**
 * Access token types enum.
 *
 * Used to distinguish between registered and unregistered users.
 */
enum AccessTokenType: string {
  case User = 'user';
  case UnregisteredUser = 'unregistered_user';
  case Unknown = 'unknown';
}
