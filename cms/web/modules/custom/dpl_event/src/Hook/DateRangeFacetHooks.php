<?php

declare(strict_types=1);

namespace Drupal\dpl_event\Hook;

use Drupal\Core\Hook\Attribute\Hook;

/**
 * Makes the event date range query type available to facets.
 *
 * @see \Drupal\dpl_event\Plugin\facets\widget\DateRangeWidget
 */
class DateRangeFacetHooks {

  /**
   * Add ranged date query type.
   *
   * Query that handles query ranges combined with date ranges.
   *
   * @param string $backend_plugin_id
   *   The search API backend plugin ID.
   * @param string[] $query_types
   *   Query type plugin IDs keyed by the query type the widget asks for.
   */
  #[Hook('facets_search_api_query_type_mapping_alter')]
  public function facetsSearchApiQueryTypeMappingAlter(string $backend_plugin_id, array &$query_types): void {
    $query_types['dpl_event_date_range'] = 'dpl_event_date_range';
  }

}
