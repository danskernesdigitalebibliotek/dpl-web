<?php

// phpcs:ignoreFile

$sites = [];

// HTTP_HOST is not set when running PHPUnit tests, so check for existence
// first.
if (isset($_SERVER['HTTP_HOST'])) {
  // Add in the host name to sites if it starts with `bnf-`. This way we don't
  // have to worry about what TLD people use (docker or local), nor the composer
  // project name (dpl-cms per default, but could be anything).
  $host = $_SERVER['HTTP_HOST'];
  if (preg_match('/^bnf-/', $host)) {
    $sites[$host] = 'bnf';
  }
}
