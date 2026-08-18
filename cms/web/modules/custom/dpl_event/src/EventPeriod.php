<?php

namespace Drupal\dpl_event;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;
use Safe\DateTimeImmutable;

/**
 * Value object which defines the stretch of time an event occurrence covers.
 *
 * The same period is expressed in three different ways around the event code:
 * recurring_events calculates occurrences as pairs of DrupalDateTime values, an
 * event instance stores its date as two strings in the storage format, and our
 * own code compares occurrences as a single string. This is the one type that
 * knows all three, so nothing else has to.
 *
 * Both ends are kept in the timezone dates are stored in, no matter which
 * timezone they arrived in, so two periods are always directly comparable.
 */
class EventPeriod {

  /**
   * When the occurrence starts.
   *
   * @var \DateTimeImmutable
   */
  public readonly \DateTimeImmutable $start;

  /**
   * When the occurrence ends.
   *
   * @var \DateTimeImmutable
   */
  public readonly \DateTimeImmutable $end;

  /**
   * Constructor.
   */
  public function __construct(\DateTimeInterface $start, \DateTimeInterface $end) {
    $timezone = new \DateTimeZone(DateTimeItemInterface::STORAGE_TIMEZONE);

    $this->start = \DateTimeImmutable::createFromInterface($start)->setTimezone($timezone);
    $this->end = \DateTimeImmutable::createFromInterface($end)->setTimezone($timezone);
  }

  /**
   * Builds a period from the date pair recurring_events works in.
   */
  public static function fromDrupalDateTimes(DrupalDateTime $start, DrupalDateTime $end): self {
    return new self($start->getPhpDateTime(), $end->getPhpDateTime());
  }

  /**
   * Builds a period from the two values an event instance stores its date as.
   *
   * @throws \Exception
   *   If either value is not a date that can be read.
   */
  public static function fromStorageValues(string $start, string $end): self {
    // Drupal stores dates in UTC by default, but if no timezone is specified
    // then the default timezone will be assumed.
    $timezone = new \DateTimeZone(DateTimeItemInterface::STORAGE_TIMEZONE);

    return new self(
      new DateTimeImmutable($start, $timezone),
      new DateTimeImmutable($end, $timezone),
    );
  }

  /**
   * The start of the period, as an event instance stores it.
   */
  public function getStartValue(): string {
    return $this->start->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT);
  }

  /**
   * The end of the period, as an event instance stores it.
   */
  public function getEndValue(): string {
    return $this->end->format(DateTimeItemInterface::DATETIME_STORAGE_FORMAT);
  }

  /**
   * The start of the period, as the recurring_events services want it.
   */
  public function getStartDrupalDateTime(): DrupalDateTime {
    return new DrupalDateTime($this->getStartValue(), DateTimeItemInterface::STORAGE_TIMEZONE);
  }

  /**
   * The end of the period, as the recurring_events services want it.
   */
  public function getEndDrupalDateTime(): DrupalDateTime {
    return new DrupalDateTime($this->getEndValue(), DateTimeItemInterface::STORAGE_TIMEZONE);
  }

  /**
   * Whether two occurrences cover the same stretch of time.
   */
  public function equals(EventPeriod $other): bool {
    return (string) $this === (string) $other;
  }

  /**
   * The identity of the occurrence covering this period.
   *
   * Two occurrences are the same occurrence when they cover the same period, so
   * this is what we recognise an occurrence by - both when looking for the ones
   * a changed recurrence no longer contains, and when looking for the ones it
   * has gained.
   */
  public function __toString(): string {
    return $this->getStartValue() . '/' . $this->getEndValue();
  }

}
