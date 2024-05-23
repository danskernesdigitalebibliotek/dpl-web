<?php

namespace Drupal\dpl_login;

/**
 * Authorization id types enum.
 *
 * Used to distinguish between different identifiers.
 */
enum AuthorizationIdType: string {
  case CPR = 'cpr';
  case UNIQUE_ID = 'unique_id';
}
