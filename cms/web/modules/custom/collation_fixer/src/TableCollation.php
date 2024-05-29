<?php

namespace Drupal\collation_fixer;

/**
 * Value object representing collation and charset for a database table.
 */
class TableCollation {

  /**
   * Constructor.
   */
  public function __construct(
    public string $table,
    public string $currentCollation,
    public string $currentCharset,
    public string $expectedCollation,
    public string $expectedCharset,
  ) {}

}
