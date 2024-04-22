<?php

namespace Drupal\dpl_login;

use Drupal\Core\TempStore\PrivateTempStoreFactory;

/**
 * Handles unregistered user token storage.
 */
class UnregisteredUserTokensProvider extends UserTokensProviderAbstract implements UserTokensProviderInterface {

  /**
   * Constructor of UnregisteredUserTokensProvider.
   *
   * @param \Drupal\Core\TempStore\PrivateTempStoreFactory $temp_store_factory
   *   User session store factory.
   */
  public function __construct(PrivateTempStoreFactory $temp_store_factory) {
    $this->tempStore = $temp_store_factory->get(static::class);
  }

  /**
   * {@inheritdoc}
   */
  protected function getAccessTokenType(): AccessTokenType {
    return AccessTokenType::UNREGISTERED_USER;
  }

}
