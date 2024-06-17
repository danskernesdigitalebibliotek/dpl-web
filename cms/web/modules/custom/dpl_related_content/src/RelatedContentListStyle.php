<?php

namespace Drupal\dpl_related_content;

/**
 * Defines which list types that are supported by related content.
 */
enum RelatedContentListStyle: string {
  case Slider = "slider";
  case Grid = "grid";
  case EventList = "event_list";
}
