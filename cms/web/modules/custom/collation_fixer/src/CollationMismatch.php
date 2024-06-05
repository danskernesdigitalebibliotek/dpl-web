<?php

namespace Drupal\collation_fixer;

/**
 * Value object for a table without the expected collation and/or charset.
 */
class CollationMismatch {

  /**
   * Constructor.
   */
  public function __construct(
    public TableCollation $expected,
    public TableCollation $actual,
  ) {}

}
