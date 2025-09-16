<?php

namespace Drupal\dpl_login;

/**
 * Authorization id types enum.
 *
 * Used to distinguish between different identifiers.
 */
enum AuthorizationIdType: string {
  case Cpr = 'cpr';
  case UniqueId = 'unique_id';
}
