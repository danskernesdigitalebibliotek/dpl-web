<?php

namespace Drupal\dpl_login;

use Drupal\Core\TempStore\PrivateTempStoreFactory;

/**
 * Handles unregistered user token storage.
 */
class UnregisteredUserTokensProvider extends RegisteredUserTokensProvider implements UserTokensProviderInterface {
  /**
   * Access token type.
   */
  protected AccessTokenType $accessTokenType = AccessTokenType::UNREGISTERED_USER;

  /**
   * Constructor of UnregisteredUserTokensProvider.
   *
   * @param \Drupal\Core\TempStore\PrivateTempStoreFactory $temp_store_factory
   *   User session store factory.
   */
  public function __construct(PrivateTempStoreFactory $temp_store_factory) {
    $this->tempStore = $temp_store_factory->get(static::class);
  }

}
