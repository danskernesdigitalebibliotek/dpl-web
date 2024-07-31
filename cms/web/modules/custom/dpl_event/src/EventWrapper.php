<?php

namespace Drupal\dpl_event;

use Brick\Math\BigDecimal;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\drupal_typed\DrupalTyped;
use Drupal\paragraphs\ParagraphInterface;
use Drupal\recurring_events\Entity\EventInstance;
use Psr\Log\LoggerInterface;
use Safe\DateTime;
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
   * Getting associated screen names.
   *
   * @return string[]
   *   The screen names.
   */
  public function getScreenNames(): array {
    $names = [];

    /** @var \Drupal\taxonomy\TermInterface[] $screens */
    $screens = $this->event->get('event_screen_names')->referencedEntities();

    foreach ($screens as $screen) {
      $names[] = $screen->getName();
    }

    return $names;
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
   * Get the url of the event if available.
   *
   * The url will usually be the place where visitors can by tickets for the
   * event.
   */
  public function getLink() : ?string {
    $linkField = $this->getField('event_link');
    return $linkField?->getString();
  }

  /**
   * Get the price(s) for the event.
   *
   * @return int[]|float[]
   *   Price(s) for the available ticket categories.
   */
  public function getTicketPrices(): array {
    $field = $this->getField('event_ticket_categories');
    if (!$field instanceof FieldItemListInterface) {
      return [];
    }

    $ticketCategories = $field->referencedEntities();
    return array_map(function (ParagraphInterface $ticketCategory) {
      return $ticketCategory->get('field_ticket_category_price')->value;
    }, $ticketCategories);
  }

  /**
   * Returns whether the event can be freely attended.
   *
   * This means that the event does not require ticketing or that all ticket
   * categories are free.
   */
  public function isFreeToAttend(): bool {
    $nonFreePrice = array_filter($this->getTicketPrices(), function (int|float $price) {
      $price = BigDecimal::of($price);
      return !$price->isZero();
    });
    return empty($nonFreePrice);
  }

  /**
   * Getting relevant updated date - either the series or instance.
   *
   * As we use inheritance, we want an updated series to also reflect update.
   * We could implement this, by programmatically saving all instances when
   * the series is saved, but this may have unforseen consequences, as it is
   * working against the Drupal system.
   * Instead, we'll look up the instance and series changed dates, and take
   * which ever is newer.
   */
  public function getUpdatedDate(): ?DateTime {
    $series = $this->event->getEventSeries();

    $changed_instance = $this->event->getChangedTime();
    $changed_series = $series->getChangedTime();

    // Setting the timestamp to whichever is the larger.
    $timestamp = ($changed_instance > $changed_series) ?
      $changed_instance : $changed_series;

    if (empty($timestamp)) {
      return NULL;
    }

    $date = new DateTime();
    $date->setTimestamp(intval($timestamp));

    return $date;
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
