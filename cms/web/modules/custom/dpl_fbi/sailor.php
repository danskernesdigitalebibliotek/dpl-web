<?php

declare(strict_types=1);

use Drupal\dpl_fbi\SailorEndpointConfig;

return [
  'fbi' => \Drupal::service(SailorEndpointConfig::class),
];
