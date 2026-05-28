<?php

namespace Drupal\dpl_campaign\Input;

/**
 * A query represents the actual inputs of the user.
 */
class Query {

  /**
   * Facet constructor.
   *
   * @param string $text
   *   The free-text input of the user.
   */
  public function __construct(public string $text) {}

}
