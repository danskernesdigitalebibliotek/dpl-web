<?php

namespace Drupal\dpl_event;

use Drupal\dpl_event\Services\EventHelper;
use Drupal\drupal_typed\DrupalTyped;
use Drupal\recurring_events\Entity\EventInstance;
use Safe\DateTimeImmutable;

/**
 * Wrapper to ease access to certain data structures on events.
 *
 * There are multiple situations where this can be relevant:
 *
 * - Embedded business logic within values
 * - Making access easier
 * - Converting values to usable types
 */
class EventWrapper {

  /**
   * Constuctor.
   */
  public function __construct(
    private EventInstance $event
  ) {}

  /**
   * Determine if an event is considered active.
   *
   * An event is considered active if it has not occurred or been cancelled.
   */
  public function isActive() : bool {
    $event_helper = DrupalTyped::service(EventHelper::class, 'dpl_event.event_helper');

    $state = $event_helper->getState($this->event);

    if (!($state instanceof EventState)) {
      return FALSE;
    }

    return !in_array($state, [EventState::Cancelled, EventState::Occurred]);
  }

  /**
   * When the event starts.
   */
  public function getStartDate(): \DateTimeInterface {
    return $this->getDate("value");
  }

  /**
   * When the event ends.
   */
  public function getEndDate(): \DateTimeInterface {
    return $this->getDate("end_value");
  }

  /**
   * Determine if two events occur on the exact same date.
   */
  public function hasSameDate(EventInstance $otherEvent): bool {
    $otherWrapper = new static($otherEvent);
    return $this->getStartDate() == $otherWrapper->getStartDate() &&
      $this->getEndDate() == $otherWrapper->getEndDate();
  }

  /**
   * Get a date for the event.
   *
   * @param "value"|"end_value" $value
   *   The part of the date to get.
   */
  private function getDate(string $value): \DateTimeInterface {
    $event_date = $this->event->get('date')->get(0);
    if (!$event_date) {
      throw new \LogicException("Unable to retrieve date from event instance");
    }

    $event_date_values = $event_date->getValue();
    if (!$event_date_values || empty($event_date_values[$value])) {
      throw new \LogicException("Unable to retrieve date from event instance");
    }
    // Drupal stores dates in UTC by default but if no timezone is specified
    // then the default timezone will be assumed.
    return new DateTimeImmutable($event_date_values[$value], new \DateTimeZone('UTC'));
  }

}
