<?php

namespace Drupal\dpl_login;

/**
 * Interface for user access tokens.
 */
interface UserTokensProviderInterface {

  /**
   * Set access token.
   */
  public function setAccessToken(AccessToken $accessToken): void;

  /**
   * Get access token or NULL if no one has been stored.
   */
  public function getAccessToken(): ?AccessToken;

  /**
   * Delete access token.
   */
  public function deleteAccessToken(): bool;

}
