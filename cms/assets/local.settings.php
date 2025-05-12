<?php

/**
 * @file
 * Configuration for LAGOON_ENVIRONMENT_TYPE=local.
 *
 * This should only be used when run in docker development setup.
 */

// Enable verbose error reporting.
$config['system.logging']['error_level'] = 'verbose';

// Disable preprocessing
// $config['system.performance']['css']['preprocess'] = FALSE;
// $config['system.performance']['js']['preprocess'] = FALSE;

// Disable the "config auto ignore" module on local development.
// When config_ignore_auto is enabled, it means that saving config-forms will
// add the saved changes as 'ignored', and won't be overriden on next deploy.
// This is a problem for development, as we obviously want to be able to
// "cex" and "cim" our updates.
$config['config_ignore_auto.settings']['status'] = FALSE;

// Point `bnf_client` to the `bnf` containers. We cannot detect from inside
// the docker setup whether the bnf instance has been activated, but we don't
// want dev environments to pair with the real BNF, so we just set it anyway.
// And this goes for the BNF instance too, it should just ignore this
// configuration.
$bnf_base_url = preg_replace('{^https://}', 'https://bnf-', getenv('LAGOON_ROUTE'));

// The URL MUST end with a slash, as is required by the config form.
$bnf_base_url = str_ends_with($bnf_base_url, '/') ? $bnf_base_url : "$bnf_base_url/";
$config['bnf_client.settings']['base_url'] = $bnf_base_url;
