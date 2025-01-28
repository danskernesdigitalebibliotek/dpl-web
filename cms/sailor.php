<?php

// phpcs:ignoreFile

declare(strict_types=1);

use Spawnia\Sailor;

// As we're not running with the Drupal autoloader, we just require the file.
require_once(__DIR__ . '/web/modules/custom/bnf/src/SailorEndpointConfig.php');

return [
  // As the sailor command is only supposed to be run in the docker
  // development setup, we just use the docker internal name for the web
  // service.
  'bnf' => new \Drupal\bnf\SailorEndpointConfig('http://nginx:8080/graphql'),
];
