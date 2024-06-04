<?php

namespace Drupal\dpl_event;

use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;
use Drupal\recurring_events\Entity\EventInstance;
use Drupal\recurring_events\Entity\EventSeries;

/**
 * Helper service for dealing with the dates from Recurring_Dates.
 */
class ReoccurringDateFormatter {

  /**
   * Inject dependencies.
   */
  public function __construct(
    protected TranslationInterface $translation,
    protected EntityTypeManagerInterface $entityTypeManager,
    protected DateFormatterInterface $dateFormatter,
  ) {}

  /**
   * Retrieves the string representation of an EventSeries date range.
   *
   * @param \Drupal\recurring_events\Entity\EventSeries $event_series
   *   The EventSeries entity object.
   *
   * @return string
   *   A human-readable string description of a date range.
   */
  public function getSeriesDateString(EventSeries $event_series): string|null {
    // Depending on the reoccuring types, we will want to build a human
    // readable string. This is necessary on this level, as e.g. weekly events
    // have a possibility to define day per week, where monthly can also
    // define day of the month.
    $recur_type = $event_series->getRecurType();

    $upcoming_event_dates = $this->getUpcomingEventDetails($event_series);
    if (empty($upcoming_event_dates)) {
      return $this->translation->translate('Expired');
    }

    $start_date = $upcoming_event_dates['start'];
    $end_date = $upcoming_event_dates['end'];

    switch ($recur_type) {
      // Daily | H:i - H:i.
      case 'daily_recurring_date':
        $date_string = $this->translation->translate('Every day');

        break;

      // Mondays, Tuesday & Wednesdays | H:i - H:i.
      case 'weekly_recurring_date':
        $week_days = [];

        foreach ($event_series->getWeeklyDays() as $week_day) {
          $week_days[] = $this->translation->translate($week_day);
        }

        $date_string = $this->translation->translate(
          'Every @days',
          ['@days' => implode(', ', $week_days)]
        );
        break;

      // DD/MM/YY | H:i - H:i.
      default:
        $upcoming_ids = $upcoming_event_dates['upcoming_ids'];

        $date_string = $this->formatDate($start_date, 'j F');

        if (count($upcoming_ids) > 1) {
          $prefix = $this->translation->translate('Next');
          $date_string = "{$prefix}: {$date_string}";
        }

        break;
    }

    $time_string = "{$this->formatDate($start_date, 'H:i')} - {$this->formatDate($end_date, 'H:i')}";

    return "$date_string $time_string";

  }

  /**
   * Retrieves the upcoming event details for a given event series.
   *
   * @param \Drupal\recurring_events\Entity\EventSeries $event_series
   *   The event series object.
   *
   * @return null|array{'start': \Drupal\Core\Datetime\DrupalDateTime, 'end': \Drupal\Core\Datetime\DrupalDateTime, 'upcoming_ids': array<int, string>}
   *   An array containing the following keys:
   *   - start: The start date of the upcoming event as a DrupalDateTime object.
   *   - end: The end date of the upcoming event as a DrupalDateTime object.
   *   - upcoming_ids: An array of upcoming event instance IDs.
   *   Returns NULL if the start and end dates are not found.
   */
  public function getUpcomingEventDetails(EventSeries $event_series): array|null {
    $date = new DrupalDateTime();
    $formatted = $date->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT);

    // Find the next upcoming eventinstance in this series - e.g., the
    // eventinstance with the earliest date value, that is not in the past.
    $query = $this->entityTypeManager->getStorage('eventinstance')->getQuery();
    $upcoming_ids = $query
      ->condition('eventseries_id', $event_series->id())
      ->condition('date.value', $formatted, '>=')
      ->accessCheck(TRUE)
      ->sort('date.value', 'ASC')
      ->execute();

    if (empty($upcoming_ids)) {
      return NULL;
    }

    // Load the first event instance - the remaining IDs are useful later on,
    // when we want to check if it is alone or not.
    $upcoming_event_id = reset($upcoming_ids);
    $event_instance = EventInstance::load($upcoming_event_id);

    if (!($event_instance instanceof EventInstance)) {
      return NULL;
    }

    if ($event_instance->get('date')->isEmpty()) {
      return NULL;
    }

    /** @var \Drupal\datetime_range\Plugin\Field\FieldType\DateRangeItem $event_instance_date */
    $event_instance_date = $event_instance->get('date')->first();

    // Return the dates, and the related IDs.
    return [
      'start' => $event_instance_date->get('start_date')->getValue(),
      'end' => $event_instance_date->get('end_date')->getValue(),
      'upcoming_ids' => $upcoming_ids,
    ];
  }

  /**
   * Format a datetime to a string respecting the local timezone.
   */
  private function formatDate(DrupalDateTime $datetime, string $format) : string {
    return $this->dateFormatter->format($datetime->getTimestamp(), 'custom', $format);
  }

}
