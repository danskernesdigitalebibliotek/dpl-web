<?php

namespace Drupal\dpl_library_agency;

/**
 * FBI Profile types.
 */
enum FbiProfileType: string {
  // The default FBI profile.
  case Default = 'default';

  // Profile name for FBI local profile.
  case Local = 'local';

  // Profile name for FBI global profile.
  case Global = 'global';
}
