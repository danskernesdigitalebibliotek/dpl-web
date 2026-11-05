<?php

namespace Drupal\dpl_opening_hours\Model\Repetition;

/**
 * Repetition which occurs once a week from the opening hours start time.
 *
 * The instance should be repeated weekly from the first day of the repetition
 * until the provided end date. The week day of the opening hours instance
 * defines which weekday should be used for the repeated instances.
 */
class WeeklyRepetition extends Repetition {

  /**
   * Constructor.
   */
  public function __construct(
    public readonly ?int $id,
    public readonly \DateTimeInterface $endDate,
  ) {}

  /**
   * The start times of the instances, until and including the end date.
   *
   * @return \DatePeriod<\DateTimeInterface, \DateTimeImmutable, null>
   *   The weekly start times from the first start time.
   */
  public function startTimes(\DateTimeInterface $firstStartTime): \DatePeriod {
    // The time of day of the end date is arbitrary: dates from requests get
    // the time of day of the request. End the period at the start of the
    // following day, as the period excludes its end.
    $periodEnd = \DateTimeImmutable::createFromInterface($this->endDate)->setTime(0, 0)->modify('+1 day');
    return new \DatePeriod($firstStartTime, new \DateInterval("P1W"), $periodEnd);
  }

}
