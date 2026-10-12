<?php

namespace Drupal\dpl_login;

use Drupal\Core\TempStore\PrivateTempStoreFactory;

/**
 * Handles Unilogin user token storage.
 *
 * Unilogin users are not patrons, so their token is never handed to the
 * React apps.
 */
class UniloginUserTokensProvider extends AbstractUserTokensProvider implements UserTokensProviderInterface {

  /**
   * Constructor of UniloginUserTokensProvider.
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
    return AccessTokenType::UniloginUser;
  }

}
