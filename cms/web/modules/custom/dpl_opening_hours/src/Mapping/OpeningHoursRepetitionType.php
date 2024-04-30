<?php

namespace Drupal\dpl_opening_hours\Mapping;

/**
 * Defines which repetition types that are supported by the API.
 */
enum OpeningHoursRepetitionType: string {
  case None = "none";
  case Weekly = "weekly";
}
