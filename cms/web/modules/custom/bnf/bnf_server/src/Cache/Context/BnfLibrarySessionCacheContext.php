<?php

namespace Drupal\bnf_server\Cache\Context;

use Drupal\bnf_server\Controller\LoginController;
use Drupal\Component\Utility\Crypt;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Cache\Context\RequestStackCacheContextBase;

/**
 * Defines the cache context service, for "per bnf client library" caching.
 *
 * Cache context ID: 'session.bnf_library_session'.
 */
class BnfLibrarySessionCacheContext extends RequestStackCacheContextBase {

  /**
   * {@inheritdoc}
   */
  public static function getLabel(): string {
    return t('BNF client library');
  }

  /**
   * {@inheritdoc}
   */
  public function getContext(): string {
    // The key should probably be somewhere else than the controller. If the key
    // is not set, we lump all non-client sessions together.
    return Crypt::hashBase64($this->requestStack->getSession()->get(LoginController::CALLBACK_URL_KEY) ?? '');
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheableMetadata(): CacheableMetadata {
    return new CacheableMetadata();
  }

}
