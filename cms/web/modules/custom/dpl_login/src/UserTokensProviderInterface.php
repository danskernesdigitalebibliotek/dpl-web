<?php

namespace Drupal\dpl_login;

/**
 * Interface for dpl_login constants.
 */
interface UserTokensProviderInterface {

  /**
   * Set access token.
   *
   * @param \Drupal\dpl_login\AccessToken $accessToken
   *   Good old access token.
   */
  public function setAccessToken(AccessToken $accessToken): void;

  /**
   * Get access token.
   *
   * @return \Drupal\dpl_login\AccessToken|null
   *   Accesstoken or NULL if no one has been stored.
   */
  public function getAccessToken(): ?AccessToken;

  /**
   * Delete access token.
   *
   * @return bool
   *   Was the token successfully deleted?
   */
  public function deleteAccessToken(): bool;

}
