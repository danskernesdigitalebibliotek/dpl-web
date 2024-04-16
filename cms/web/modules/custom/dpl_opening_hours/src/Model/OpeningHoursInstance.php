<?php

namespace Drupal\dpl_opening_hours\Model;

use Drupal\node\NodeInterface;
use Drupal\taxonomy\TermInterface;
use function Safe\sprintf as sprintf;

/**
 * Value object which defines a single time period where a branch is open.
 */
class OpeningHoursInstance {

  /**
   * Constructor.
   */
  public function __construct(
    public ?int $id,
    public NodeInterface $branch,
    public TermInterface $categoryTerm,
    public \DateTimeInterface $startTime,
    public \DateTimeInterface $endTime,
  ) {
    // An opening hours instance must start and end on the same day. We do not
    // have any standard date structure to represent this so instead validate
    // the two datetimes used to represent start and end.
    if ($this->startTime > $this->endTime) {
      throw new \InvalidArgumentException(sprintf("End time for opening hours (%s) must be greater than start time (%s)",
        $this->endTime->format('c'),
        $this->startTime->format('c'),));
    }
    $startDay = $this->startTime->format('Y-z');
    $endDay = $this->endTime->format('Y-z');
    if ($startDay !== $endDay) {
      throw new \InvalidArgumentException(sprintf(
        "Opening hours must have same start (%s) and end date (%s)",
        $startDay,
        $endDay
      ));
    }
  }

}
