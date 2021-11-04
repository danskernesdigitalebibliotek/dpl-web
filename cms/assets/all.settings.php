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

// Defines where the sync folder of your configuration lives. In this case it's
// inside the Drupal root, which is protected by amazee.io Nginx configs, so it
// cannot be read via the browser. If your Drupal root is inside a subfolder
// (like 'web') you can put the config folder outside this subfolder for an
// advanced security measure: '../config/sync'.
$settings['config_sync_directory'] = '../config/sync';

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
    // Do not enable the the cache if php does not have the extension enabled.
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
