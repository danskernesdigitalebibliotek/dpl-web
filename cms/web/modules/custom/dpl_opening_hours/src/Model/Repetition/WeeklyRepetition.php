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

}
