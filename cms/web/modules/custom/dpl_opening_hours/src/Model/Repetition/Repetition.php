<?php

namespace Drupal\dpl_opening_hours\Model\Repetition;

/**
 * Base class for all repetition value objects.
 *
 * A repetition represents a pattern for which opening hours are repeated over
 * time.
 */
abstract class Repetition {

  /**
   * Constructor.
   *
   * @param ?int $id
   *   Unique identifier for the repetition. Repetitions with the same id are
   *   considered equal.
   */
  public function __construct(
    public readonly ?int $id = NULL,
  ) {}

}
