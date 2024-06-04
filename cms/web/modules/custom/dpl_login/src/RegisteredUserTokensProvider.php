<?php

namespace Drupal\dpl_login;

use Drupal\Core\TempStore\PrivateTempStoreFactory;

/**
 * Handles user token storage.
 */
class RegisteredUserTokensProvider extends AbstractUserTokensProvider implements UserTokensProviderInterface {

  /**
   * Constructor of RegisteredUserTokensProvider.
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
    return AccessTokenType::USER;
  }

}
