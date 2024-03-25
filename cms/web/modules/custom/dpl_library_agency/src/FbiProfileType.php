<?php

namespace Drupal\dpl_library_agency;

/**
 * FBI Profile types.
 */
enum FbiProfileType: string {
  // The default FBI profile.
  case DEFAULT = 'default';

  // Profile name for FBI local profile.
  case LOCAL = 'local';

  // Profile name for FBI global profile.
  case GLOBAL = 'global
  ';
}
