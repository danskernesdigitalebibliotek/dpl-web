<?php

namespace Drupal\dpl_login;

use Drupal\Core\TempStore\PrivateTempStore;
use Drupal\Core\TempStore\PrivateTempStoreFactory;

/**
 * Handles user token storage.
 */
class UserTokensProvider {

  /**
   * User session storage.
   *
   * @var \Drupal\Core\TempStore\PrivateTempStore
   */
  protected PrivateTempStore $tempStore;

  /**
   * Constructor of UserTokensProvider.
   *
   * @param \Drupal\Core\TempStore\PrivateTempStoreFactory $temp_store_factory
   *   User session store factory.
   */
  public function __construct(PrivateTempStoreFactory $temp_store_factory) {
    $this->tempStore = $temp_store_factory->get(__CLASS__);
  }

  /**
   * Set access token.
   *
   * @param \Drupal\dpl_login\AccessToken $accessToken
   *   Good old access token.
   */
  public function setAccessToken(AccessToken $accessToken): void {
    $this->tempStore->set('access_token', $accessToken);
  }

  /**
   * Get access token.
   *
   * @return \Drupal\dpl_login\AccessToken|null
   *   Accesstoken or NULL if no one has been stored.
   */
  public function getAccessToken(): ?AccessToken {
    return $this->tempStore->get('access_token');
  }

}
