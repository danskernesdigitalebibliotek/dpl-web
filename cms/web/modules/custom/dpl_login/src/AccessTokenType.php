<?php

namespace Drupal\dpl_login;

/**
 * Access token types enum.
 *
 * Used to distinguish between registered and unregistered users, and users
 * logged in with Unilogin.
 */
enum AccessTokenType: string {
  case User = 'user';
  case UnregisteredUser = 'unregistered_user';
  case UniloginUser = 'unilogin_user';
  case Unknown = 'unknown';
}
