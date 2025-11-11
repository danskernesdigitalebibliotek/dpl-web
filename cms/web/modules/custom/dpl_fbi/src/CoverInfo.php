<?php

namespace Drupal\dpl_fbi;

/**
 * Cover URL and size information.
 */
class CoverInfo {

  public function __construct(
    public readonly string $url,
    public readonly int $height,
    public readonly int $width,
  ) {}

}
