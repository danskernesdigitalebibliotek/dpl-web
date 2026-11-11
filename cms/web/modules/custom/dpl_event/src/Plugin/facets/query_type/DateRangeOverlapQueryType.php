<?php

declare(strict_types=1);

namespace Drupal\dpl_event\Plugin\facets\query_type;

use Drupal\facets\Plugin\facets\query_type\SearchApiRange;
use Drupal\search_api\Query\QueryInterface;

/**
 * Matches items whose start/end period overlaps the selected date range.
 *
 * Events have both a start and an end date. When a user picks a range they
 * expect every event that is happening at some point within it, not just the
 * ones starting within it. An event overlaps [from, to] when it starts no later
 * than "to" and ends no earlier than "from".
 *
 * The facet field is used as the start date. The end date field is configured
 * on the widget. Without one the start date is used for both, which reduces to
 * a plain "starts within the range" match.
 *
 * Expects active items as [from, to] timestamp pairs, as prepared by
 * \Drupal\dpl_event\Plugin\facets\processor\DateRangeProcessor.
 *
 * @FacetsQueryType(
 *   id = "dpl_event_date_range",
 *   label = @Translation("Date range overlap", context = "dpl_event"),
 * )
 */
class DateRangeOverlapQueryType extends SearchApiRange {

  /**
   * {@inheritdoc}
   */
  public function execute(): void {
    $query = $this->query;
    $start_field = $this->facet->getFieldIdentifier();
    $end_field = $this->facet->getWidgetInstance()->getConfiguration()['end_field'] ?? '';
    $end_field = $end_field ?: $start_field;

    if ($query->getProcessingLevel() === QueryInterface::PROCESSING_FULL) {
      // Still collect facet results for the start field. The widget needs at
      // least one result to render.
      $options = &$query->getOptions();
      $options['search_api_facets'][$start_field] = $this->getFacetOptions();
    }

    $active_items = array_filter($this->facet->getActiveItems());
    if (!$active_items) {
      return;
    }

    $filter = $query->createConditionGroup($this->facet->getQueryOperator(), ['facet:' . $start_field]);
    foreach ($active_items as $item) {
      [$from, $to] = $item;
      $overlap = $query->createConditionGroup('AND');
      $overlap->addCondition($start_field, $to, '<=');
      $overlap->addCondition($end_field, $from, '>=');
      $filter->addConditionGroup($overlap);
    }

    $query->addConditionGroup($filter);
  }

}
