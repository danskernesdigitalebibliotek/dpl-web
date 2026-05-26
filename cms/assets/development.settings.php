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

if ($project === 'dpl-web') {
  $pr_title = getenv('LAGOON_PR_TITLE');

  // If this is a bnf pull-request, point the client to the corresponding
  // dpl-bnf PR environment.
  if ($pr_title && preg_match('/^bnf: /i', $pr_title)) {
    $config['bnf_client.settings']['base_url'] = 'https://varnish.' .
      getenv('LAGOON_ENVIRONMENT') . '.dpl-web-bnf.dplplat02.dpl.reload.dk/';
  }

  // Dev environments just use environment vars.
  $config['openid_connect.client.adgangsplatformen']['settings']['client_id'] = getenv('OPENID_CLIENT_ID');
  $config['openid_connect.client.adgangsplatformen']['settings']['client_secret'] = getenv('OPENID_CLIENT_SECRET');
  $config['openid_connect.client.adgangsplatformen']['settings']['agency_id'] = getenv('OPENID_AGENCY_ID');
  $config['dpl_unilogin.settings']['unilogin_api_client_secret'] = getenv('UNILOGIN_CLIENT_SECRET');
  $config['dpl_unilogin.settings']['unilogin_api_pubhub_retailer_key_code'] = getenv('UNILOGIN_PUBHUB_RETAILER_KEY_CODE');
  $config['dpl_unilogin.settings']['unilogin_api_municipality_id'] = getenv('UNILOGIN_MUNICIPALITY_ID');
}
