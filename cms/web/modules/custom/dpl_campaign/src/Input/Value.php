<?php

namespace Drupal\dpl_campaign\Input;

/**
 * A value represents the number of times a term occurs within a search result.
 */
class Value {

  /**
   * Construct a new value.
   *
   * @param string $key
   *   The key to use when applying filters based on the facet.
   * @param string $term
   *   The term.
   * @param int $score
   *   The relevance of the term within the search result. This will usually be
   *   the number of times the term occurs within works contained in the search
   *   result. Default to 0 (no occurrences) if not specified.
   */
  public function __construct(
    public string $key,
    public string $term,
    public int $score = 0,
  ) {
  }

}
