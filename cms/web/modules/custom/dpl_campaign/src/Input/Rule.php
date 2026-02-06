<?php

namespace Drupal\dpl_campaign\Input;

/**
 * A rule represents the ranking of a term within a facet relating to a result.
 */
class Rule {

  /**
   * Construct a new rule.
   *
   * @param string $facetName
   *   The name of the facet.
   * @param string $valueTerm
   *   The name of the term.
   * @param int $ranking
   *   The ranking of the term within the facet. Rank 1 will be the most
   *   frequent term, rank 2 the second most frequent and so on.
   */
  public function __construct(
    public string $facetName,
    public string $valueTerm,
    public int $ranking,
  ) {
  }

}
