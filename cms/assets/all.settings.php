<?php

/**
 * @file
 * Amazee.io Drupal all environment configuration file.
 *
 * This file should contain all settings.php configurations that are needed by
 * all environments.
 *
 * It contains some defaults that the amazee.io team suggests, please edit them
 * as required.
 */

use Drupal\Core\Installer\InstallerKernel;

// Hardcode a Site UUID to enable sharing of configuration between sites beyond
// site install.
$config['system.site']['uuid'] = '13ef1a53-dfb4-4c82-9b64-44586a366729';

// Hardcode the site mail as we don't want to allow changing it in the UI.
// The email needs to match what is setup in Azure Communication Services.
$config['system.site']['mail'] = 'mail@folkebibliotekernescms.dk';

// Configure logging using the project name and environment from the Lagoon
// environment.
$config['jsonlog.settings']['jsonlog_siteid'] = getenv('LAGOON_PROJECT') . '_' . getenv('LAGOON_ENVIRONMENT');
$config['jsonlog.settings']['jsonlog_canonical'] = getenv('LAGOON_PROJECT') . '_' . getenv('LAGOON_ENVIRONMENT');
if (InstallerKernel::installationAttempted()) {
  // During the installation we can end up in situations where both JSONLog ond
  // Drupal will output messages. Squash any messages coming from JSONLog by
  // setting a low (meaning high) threshold.
  $config['jsonlog.settings']['jsonlog_stdout'] = TRUE;
  $config['jsonlog.settings']['jsonlog_severity_threshold'] = 0;
}

// Exclude development modules from configuration export.
$settings['config_exclude_modules'] = [
  'dpl_related_content_tests',
  'dpl_example_content',
  'dpl_example_breadcrumb',
  'dblog',
  'devel',
  'devel_generate',
  'field_ui',
  'purge_ui',
  'views_ui',
  'restui',
  'upgrade_status',
  'uuid_url',
];

// Defines where the sync folder of your configuration lives. In this case it's
// inside the Drupal root, which is protected by amazee.io Nginx configs, so it
// cannot be read via the browser. If your Drupal root is inside a subfolder
// (like 'web') you can put the config folder outside this subfolder for an
// advanced security measure: '../config/sync'.
$settings['config_sync_directory'] = '../config/sync';

// Set service base urls for the react apps.
$config['dpl_react_apps.settings']['services'] = [
  'cover' => ['base_url' => 'https://cover.dandigbib.org'],
  // @todo This should be updated to use the correct URL when available.
  'fbi' => ['base_url' => 'https://temp.fbi-api.dbc.dk/[profile]/graphql'],
  'material-list' => ['base_url' => 'https://prod.materiallist.dandigbib.org'],
];

// Use Danish collation to support proper sorting with Danish characters.
// Without this ÆØÅ will not be handled properly.
$databases['default']['default']['charset'] = 'utf8mb4';
$databases['default']['default']['collation'] = 'utf8mb4_danish_ci';

if (getenv('CI')) {
  // Curl settings needed to make PHP ignore SSL errors when using Wiremock as
  // a proxy. We do not have a proper SSL setup with trusted certificates.
  $settings['http_client_config']['verify'] = FALSE;
  $settings['http_client_config']['curl'] = [
    CURLOPT_PROXY_SSL_VERIFYHOST => 0,
    CURLOPT_PROXY_SSL_VERIFYPEER => FALSE,
  ];
  // Specify non-HTTP versions of endpoints. This is required to make Cypress
  // mocking work. It does not support ignoring self-signed certificates from
  // Wiremock.
  // Service base urls for the external APIs.
  $config['dpl_fbs.settings'] = ['base_url' => 'http://fbs-openplatform.dbc.dk'];
  $config['dpl_publizon.settings'] = ['base_url' => 'http://pubhub-openplatform.dbc.dk'];
  // Adgangsplatformen OpenID Connect client.
  $config['openid_connect.settings.adgangsplatformen']['settings']['authorization_endpoint'] = 'http://login.bib.dk/oauth/authorize';
  $config['openid_connect.settings.adgangsplatformen']['settings']['token_endpoint'] = 'http://login.bib.dk/oauth/token/';
  $config['openid_connect.settings.adgangsplatformen']['settings']['userinfo_endpoint'] = 'http://login.bib.dk/userinfo/';
  $config['openid_connect.settings.adgangsplatformen']['settings']['logout_endpoint'] = 'http://login.bib.dk/logout';
  // The actual values here are not important. The primary thing is that the
  // Adgangsplatformen OpenID Connect client is configured.
  $config['openid_connect.settings.adgangsplatformen']['settings']['client_id'] = 'dummy-id';
  $config['openid_connect.settings.adgangsplatformen']['settings']['client_id'] = 'dummy-secret';
  $config['openid_connect.settings.adgangsplatformen']['settings']['agency_id'] = '100200';

  // Set service base urls for the react apps.
  // We need http domains for testing in CI context.
  $config['dpl_react_apps.settings']['services'] = [
    'cover' => ['base_url' => 'http://cover.dandigbib.org'],
    // @todo This should be updated to use the correct URL when available.
    'fbi' => ['base_url' => 'http://temp.fbi-api.dbc.dk/[profile]/graphql'],
    'material-list' => ['base_url' => 'http://prod.materiallist.dandigbib.org'],
  ];

  // We need to be fixed language in our UI texts
  // because we use them for assertions in tests.
  $config['language.negotiation']['selected_langcode'] = 'en';
}

if (getenv('LAGOON_ENVIRONMENT_TYPE') !== 'production') {
  // Skip file system permissions hardening.
  //
  // The system module will periodically check the permissions of your site's
  // site directory to ensure that it is not writable by the website user. For
  // sites that are managed with a version control system, this can cause
  // problems when files in that directory such as settings.php are updated,
  // because the user pulling in the changes won't have permissions to modify
  // files in the directory.
  $settings['skip_permissions_hardening'] = TRUE;

  // Set default Unilogin configuration on non-production environments.
  $config['dpl_unilogin.settings']['unilogin_api_endpoint'] = 'https://et-broker.unilogin.dk';
  $config['dpl_unilogin.settings']['unilogin_api_wellknown_endpoint'] = 'https://et-broker.unilogin.dk/auth/realms/broker/.well-known/openid-configuration';
}

// Setup Redis.
if (getenv('LAGOON')) {
  // Prepare the module configuration.
  $settings['redis.connection']['interface'] = 'PhpRedis';
  $settings['redis.connection']['host'] = getenv('REDIS_HOST') ?: 'redis';
  $settings['redis.connection']['port'] = getenv('REDIS_SERVICE_PORT') ?: '6379';
  $settings['cache_prefix']['default'] = getenv('LAGOON_PROJECT') . '_' . getenv('LAGOON_GIT_SAFE_BRANCH');

  // But only enable the module if we are ready.
  if (
    // Do not enable the cache during install.
    !InstallerKernel::installationAttempted()
    // Do not enable the cache if php does not have the extension enabled.
    && extension_loaded('redis')
  ) {
    // Enable the cache backend.
    $settings['cache']['default'] = 'cache.backend.redis';

    // The default example configuration that ships with the module works fine.
    // By using it, we rely on future developers that updates the module to
    // spot if any major changes happens to the config, but as we're using the
    // same version of redis in all environment including our local environment
    // and automated tests, breaking changes should be detected.
    // This is the tradeoff for on the other hand to get an updated example-
    // file.
    $settings['container_yamls'][] = 'modules/contrib/redis/example.services.yml';

    // Allow the services to work before the Redis module itself is enabled.
    $settings['container_yamls'][] = 'modules/contrib/redis/redis.services.yml';

    // And allows to use it without the Redis module being enabled.
    $class_loader->addPsr4('Drupal\\redis\\', 'modules/contrib/redis/src');

    $settings['bootstrap_container_definition'] = [
      'parameters' => [],
      'services' => [
        'redis.factory' => [
          'class' => 'Drupal\redis\ClientFactory',
        ],
        'cache.backend.redis' => [
          'class' => 'Drupal\redis\Cache\CacheBackendFactory',
          'arguments' => [
            '@redis.factory',
            '@cache_tags_provider.container',
            '@serialization.phpserialize',
          ],
        ],
        'cache.container' => [
          'class' => '\Drupal\redis\Cache\PhpRedis',
          'factory' => ['@cache.backend.redis', 'get'],
          'arguments' => ['container'],
        ],
        'cache_tags_provider.container' => [
          'class' => 'Drupal\redis\Cache\RedisCacheTagsChecksum',
          'arguments' => ['@redis.factory'],
        ],
        'serialization.phpserialize' => [
          'class' => 'Drupal\Component\Serialization\PhpSerialize',
        ],
      ],
    ];
  }
}
