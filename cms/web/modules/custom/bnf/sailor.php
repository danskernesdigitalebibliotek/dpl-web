<?php

// phpcs:ignoreFile

declare(strict_types=1);

return [
  // As the sailor command is only supposed to be run in the docker
  // development setup, we just use the docker internal name for the web
  // service.
  'bnf' => new \Drupal\bnf\SailorEndpointConfig('http://bnfnginx:8080/graphql'),
];
