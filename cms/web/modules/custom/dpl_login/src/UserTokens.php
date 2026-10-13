<?php

namespace Drupal\dpl_login;

use Drupal\Component\DependencyInjection\ContainerInterface;

/**
 * Handles logic around registered, unregistered and Unilogin user tokens.
 */
class UserTokens {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    protected UserTokensProviderInterface $registeredUserTokensProvider,
    protected UserTokensProviderInterface $unregisteredUserTokensProvider,
    protected UserTokensProviderInterface $uniloginUserTokensProvider,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      $container->get('dpl_login.registered_user_tokens'),
      $container->get('dpl_login.unregistered_user_tokens'),
      $container->get('dpl_login.unilogin_user_tokens'),
    );
  }

  /**
   * Get access token. If user is not registered, get unregistered user token.
   */
  public function getCurrent(): ?AccessToken {
    if ($access_token = $this->unregisteredUserTokensProvider->getAccessToken()) {
      return $access_token;
    }
    if ($access_token = $this->registeredUserTokensProvider->getAccessToken()) {
      return $access_token;
    }
    if ($access_token = $this->uniloginUserTokensProvider->getAccessToken()) {
      return $access_token;
    }

    return NULL;
  }

  /**
   * Is the current user a logged-in Unilogin student?
   */
  public function isUniloginUser(): bool {
    return $this->getCurrent()?->type === AccessTokenType::UniloginUser;
  }

  /**
   * Get the uni-id of the logged-in Unilogin student, if any.
   *
   * @return string|null
   *   The uni-id, or NULL if the current user is not a Unilogin student.
   */
  public function getUniloginUserId(): ?string {
    return $this->isUniloginUser() ? $this->getCurrent()?->uniId : NULL;
  }

}
