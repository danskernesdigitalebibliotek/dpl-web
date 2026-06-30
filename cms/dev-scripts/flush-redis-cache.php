<?php

/**
 * @file
 * Flushes the entire Redis instance that backs Drupal's cache.
 *
 * For cases where `drush cache:rebuild` cannot recover on its own, like if
 * the cache is poisoned by stale module/entity registries.
 *
 * Usage:
 *   php tools/flush-redis-cache.php
 *
 * Connection is configured via the same environment variables Drupal uses:
 *   REDIS_HOST          (default: redis)
 *   REDIS_SERVICE_PORT  (default: 6379)
 *
 * On any problem it prints a message to STDERR and exits non-zero, so callers
 * running with `set -e` fail loudly rather than silently leaving a poisoned
 * cache behind.
 */

declare(strict_types=1);

/**
 * Prints an error message to STDERR and aborts with a non-zero exit code.
 */
function fail(string $message): never {
  fwrite(STDERR, "flush-redis-cache: $message\n");
  exit(1);
}

if (!extension_loaded('redis')) {
  fail('the PhpRedis extension is not loaded; cannot flush the Redis cache.');
}

$host = getenv('REDIS_HOST') ?: 'redis';

$portValue = getenv('REDIS_SERVICE_PORT');
if ($portValue === FALSE || $portValue === '') {
  $port = 6379;
}
elseif (!ctype_digit($portValue)) {
  fail(sprintf('REDIS_SERVICE_PORT must be a positive integer, got "%s".', $portValue));
}
else {
  $port = (int) $portValue;
}

$redis = new Redis();

try {
  // Use a short, explicit timeout so a missing or misconfigured host fails fast
  // with a clear message instead of hanging the install.
  if (!$redis->connect($host, $port, 2.0)) {
    fail(sprintf('could not connect to Redis at %s:%d.', $host, $port));
  }

  if (!$redis->flushAll()) {
    fail(sprintf('FLUSHALL against Redis at %s:%d did not succeed.', $host, $port));
  }
}
catch (RedisException $e) {
  fail(sprintf('error talking to Redis at %s:%d: %s', $host, $port, $e->getMessage()));
}

echo sprintf("Flushed Redis cache at %s:%d.\n", $host, $port);
