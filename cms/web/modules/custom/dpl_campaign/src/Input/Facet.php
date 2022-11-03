<?php

namespace Drupal\dpl_campaign\Input;

/**
 * A facet represents a named group of values which relate to a search result.
 */
class Facet {

  /**
   * The name of the facet.
   *
   * @var string
   */
  public string $name;

  /**
   * The values which relate to the search result.
   *
   * @var \Drupal\dpl_campaign\Input\Value[]
   */
  public array $values;

  /**
   * Facet constructor.
   *
   * @param string $name
   *   The name of the facet.
   * @param \Drupal\dpl_campaign\Input\Value[] $values
   *   The values of the facet.
   */
  public function __construct(string $name, array $values) {
    $this->name = $name;
    $this->values = $values;
  }

}
