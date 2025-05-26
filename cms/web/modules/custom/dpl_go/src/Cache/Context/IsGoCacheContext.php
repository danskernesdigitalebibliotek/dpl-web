<?php

namespace Drupal\dpl_go\Cache\Context;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Cache\Context\CacheContextInterface;
use Drupal\dpl_go\GoSite;

/**
 * Defines the "is Go site" cache context.
 *
 * Cache context ID: 'dpl_is_go'.
 */
class IsGoCacheContext implements CacheContextInterface {

  /**
   * Constructor.
   */
  public function __construct(protected GoSite $goSite) {}

  /**
   * {@inheritdoc}
   *
   * This is why we can't declare(strict_types=1);
   */
  public static function getLabel(): string {
    return t('Is Go site');
  }

  /**
   * {@inheritdoc}
   */
  public function getContext(): string {
    return $this->goSite->isGoSite() ? '1' : '0';
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheableMetadata(): CacheableMetadata {
    return new CacheableMetadata();
  }

}
