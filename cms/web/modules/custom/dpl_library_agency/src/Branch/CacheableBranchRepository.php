<?php

namespace Drupal\dpl_library_agency\Branch;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Cache\CacheBackendInterface;

/**
 * Retrieves and caches agency branch information.
 */
class CacheableBranchRepository implements BranchRepositoryInterface {

  /**
   * Constructor.
   *
   * @param BranchRepositoryInterface $api
   *   The repository responsible for retrieving the actual data.
   * @param \Drupal\Core\Cache\CacheBackendInterface $cache
   *   The cache used to store data.
   * @param \Drupal\Component\Datetime\TimeInterface $time
   *   Determine the current time.
   * @param int $lifetime
   *   The number of seconds to cache the data.
   *   Use CacheBackendInterface::CACHE_PERMANENT to disable time-based expiry.
   */
  public function __construct(
    protected BranchRepositoryInterface $api,
    protected CacheBackendInterface $cache,
    protected TimeInterface $time,
    protected int $lifetime = CacheBackendInterface::CACHE_PERMANENT,
  ) {}

  /**
   * {@inheritdoc}
   */
  public function getBranches(): array {
    $cid = __CLASS__ . ':' . __FUNCTION__;
    $cache = $this->cache->get($cid);
    if (isset($cache->data) && is_array($cache->data)) {
      return $cache->data;
    }

    $branches = $this->api->getBranches();
    $expire = ($this->lifetime == CacheBackendInterface::CACHE_PERMANENT) ?
      CacheBackendInterface::CACHE_PERMANENT :
      $this->time->getRequestTime() + $this->lifetime;
    $this->cache->set($cid, $branches, $expire);

    return $branches;
  }

}
