<?php

namespace Drupal\dpl_login;

use Drupal\Core\TempStore\PrivateTempStoreFactory;

/**
 * Handles user token storage.
 */
class RegisteredUserTokensProvider extends UserTokensProviderAbstract implements UserTokensProviderInterface {
  /**
   * Access token type.
   */
  protected AccessTokenType $accessTokenType = AccessTokenType::USER;

  /**
   * Constructor of RegisteredUserTokensProvider.
   *
   * @param \Drupal\Core\TempStore\PrivateTempStoreFactory $temp_store_factory
   *   User session store factory.
   */
  public function __construct(PrivateTempStoreFactory $temp_store_factory) {
    $this->tempStore = $temp_store_factory->get(static::class);
  }

}
