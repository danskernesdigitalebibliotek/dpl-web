<?php

namespace Drupal\dpl_das\Input;

/**
 * Value object for an order for a digital copy of an article by a patron.
 */
class ArticleOrder {

  /**
   * Constructor.
   *
   * @param string $pid
   *   The post id for the article to order a digital copy of.
   *   Example: 870971-tsart:34310815.
   * @param string $email
   *   The email of the user to send the digital copy of the article to.
   */
  public function __construct(
    public string $pid,
    public string $email
  ) {}

}
