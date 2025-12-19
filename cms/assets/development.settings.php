<?php

/**
 * @file
 * Configuration for LAGOON_ENVIRONMENT_TYPE=development.
 *
 * Development environments is all non-main environments in Lagoon.
 */

// Enable verbose error reporting.
$config['system.logging']['error_level'] = 'verbose';

$project = getenv('LAGOON_PROJECT');

if ($project === 'dpl-cms') {
  $pr_title = getenv('LAGOON_PR_TITLE');

  // If this is a bnf pull-request, point the client to the corresponding
  // dpl-bnf PR environment.
  if ($pr_title && preg_match('/^bnf: /i', $pr_title)) {
    $config['bnf_client.settings']['base_url'] = 'https://varnish.' .
      getenv('LAGOON_ENVIRONMENT') . '.dpl-bnf.dplplat02.dpl.reload.dk/';
  }
}
