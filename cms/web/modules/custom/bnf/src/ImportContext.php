<?php

declare(strict_types=1);

namespace Drupal\bnf;

/**
 * Represents the current import context. Managed by the ImportContextStack.
 */
class ImportContext {

  /**
   * Constructor.
   */
  public function __construct(
    public readonly string $endpointUrl,
  ) {}

}
