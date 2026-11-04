<?php

declare(strict_types=1);

namespace Drupal\dpl_event;

use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\dpl_event\Entity\EventInstance;
use Drupal\recurring_events\Entity\EventSeries;

/**
 * Groups rendered event instance rows for event lists.
 *
 * Each item is expected to be wrapped as ['content' => $entity_render_array],
 * matching the structure produced by views_view_unformatted.
 */
class EventRowGrouper {

  public function __construct(protected DateFormatterInterface $dateFormatter) {}

  /**
   * Marks consecutive event instances from the same series as stacked.
   *
   * Walks an ordered list of render items and flags each item whose preceding
   * sibling belongs to the same event series. Flagged items get
   * 'shouldBeStacked' set on the wrapper and have their view mode switched to
   * 'stacked_event' so the theme can render them in a compact, stacked form.
   *
   * @param array<mixed> $items
   *   The list of wrapped render items.
   *
   * @return array<mixed>
   *   The items with stacked metadata, cache tags and contexts applied.
   */
  public function stackSeries(array $items): array {
    foreach ($items as $index => &$item) {
      if (($item['content']['#view_mode'] ?? NULL) !== 'list_teaser_stacked_parent' ||
        !($item['content']['#eventinstance'] ?? NULL) instanceof EventInstance) {
        continue;
      }

      $eventInstance = $item['content']['#eventinstance'];
      $eventSeries = $eventInstance->getEventSeries();

      $shouldBeStacked = FALSE;

      // Check if not first row and previous event_series_id matches. An
      // instance whose series has been deleted belongs with nothing, so it is
      // never stacked.
      $priorInstance = $items[$index - 1]['content']['#eventinstance'] ?? NULL;
      if ($eventSeries instanceof EventSeries && $priorInstance instanceof EventInstance) {
        $priorSeries = $priorInstance->getEventSeries();
        $shouldBeStacked = $priorSeries instanceof EventSeries
          && $eventSeries->id() === $priorSeries->id();
      }

      $item['shouldBeStacked'] = $shouldBeStacked;

      if ($shouldBeStacked) {
        $item['content']['#view_mode'] = 'stacked_event';
      }

      // Add cache tags to ensure stacked view is recalculated for factors that
      // can affect the order:
      // - Events are created/updated/deleted
      // - Path and url arguments as this can effect filtering and ordering.
      $item['content']['#cache']['tags'][] = 'eventinstance_list';
      $item['content']['#cache']['contexts'][] = 'url';
    }

    return $items;
  }

  /**
   * Groups event rows by month, un-stacking the first event of each month.
   *
   * The overview is sorted chronologically, so one pass suffices. Each event
   * row gets 'month_label' (localized month name, built server-side so
   * translation and timezone match the other dates) and 'month_key' (the 'Y-m'
   * grouping key, so the same month name in different years opens a new
   * separator).
   *
   * A month's first event is also un-stacked to a full teaser; otherwise, if it
   * continues a series from the previous month, the stacker would render it as
   * a parent-less "stacked" row under the heading, which looks broken.
   *
   * Must run after stackSeries().
   *
   * @param array<mixed> $items
   *   The list of wrapped render items.
   *
   * @return array<mixed>
   *   The items, with month data set and month-starting events un-stacked.
   */
  public function groupByMonth(array $items): array {
    $previous_month = NULL;

    foreach ($items as &$item) {
      $event_instance = $item['content']['#eventinstance'] ?? NULL;

      // Only events take part in month grouping; leave any other row untouched.
      if (!($event_instance instanceof EventInstance)) {
        continue;
      }

      $timestamp = $event_instance->getStartDate()->getTimestamp();

      // Label is the month name without year; grouping keys off 'Y-m'.
      $item['month_label'] = $this->dateFormatter->format($timestamp, 'custom', 'F');
      $month_key = $this->dateFormatter->format($timestamp, 'custom', 'Y-m');
      $item['month_key'] = $month_key;

      $is_month_start = $month_key !== $previous_month;
      $previous_month = $month_key;

      if ($is_month_start && ($item['shouldBeStacked'] ?? FALSE)) {
        $item['shouldBeStacked'] = FALSE;
        $item['content']['#view_mode'] = 'list_teaser_stacked_parent';
      }
    }

    return $items;
  }

}
