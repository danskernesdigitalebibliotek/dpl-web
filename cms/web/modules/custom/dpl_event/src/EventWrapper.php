<?php

namespace Drupal\dpl_event;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\drupal_typed\DrupalTyped;
use Drupal\recurring_events\Entity\EventInstance;
use Psr\Log\LoggerInterface;
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
    private EventInstance $event,
  ) {}

  /**
   * Determine if an event is considered active.
   *
   * An event is considered active if it has not occurred or been cancelled.
   */
  public function isActive() : bool {
    $state = $this->getState();

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

  /**
   * Getting an events branches.
   *
   * @return array<\Drupal\node\NodeInterface>|null
   *   The matching branches.
   */
  public function getBranches(): ?array {
    $field = $this->getField('branch');

    if (!$field instanceof FieldItemListInterface) {
      return NULL;
    }

    return $field->referencedEntities() ?? NULL;
  }

  /**
   * Getting the description, from the first available text paragraph.
   */
  public function getDescription(): ?string {
    /** @var \Drupal\paragraphs\ParagraphInterface[] $paragraphs */
    $paragraphs = $this->event->get('event_paragraphs')->referencedEntities();

    foreach ($paragraphs as $paragraph) {
      if ($paragraph->bundle() === 'text_body') {
        return $paragraph->get('field_body')->getValue()[0]['value'] ?? NULL;
      }
    }

    return NULL;
  }

  /**
   * Get the EventState object of an eventinstance.
   */
  public function getState(): ?EventState {
    $field = $this->getField('event_state');

    if (!$field instanceof FieldItemListInterface) {
      return NULL;
    }

    $states = array_map(function (array $value) {
      try {
        return EventState::from($value['value']);
      }
      catch (\Error $e) {
        $logger = DrupalTyped::service(LoggerInterface::class, 'dpl_event.logger');
        $logger->error($e->getMessage());
         return NULL;
      }
    }, $field->getValue());

    $state = $states[0] ?? NULL;

    if ($state instanceof EventState) {
      return $state;
    }

    return NULL;
  }

  /**
   * Loading the field if it exists.
   *
   * Bear in mind that you probably want to use e.g. event_description instead
   * of field_description, as you then get the inheritance from series.
   */
  public function getField(string $field_name): ?FieldItemListInterface {
    // First, let's look up the custom field - does it already have a value?
    if ($this->event->hasField($field_name)) {
      $field = $this->event->get($field_name);

      if (!$field->isEmpty()) {
        return $field;
      }
    }

    return NULL;
  }

}
