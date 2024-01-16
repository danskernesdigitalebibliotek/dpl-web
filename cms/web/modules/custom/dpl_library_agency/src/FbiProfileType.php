<?php

namespace Drupal\dpl_library_agency;

/**
 * FBI Profile types.
 */
enum FbiProfileType: string {
  // The default FBI profile.
  case DEFAULT = 'default';

  // Profile name for FBI search profile.
  case SEARCH = 'search';

  // Profile name for FBI material profile.
  case MATERIAL = 'material';
}
