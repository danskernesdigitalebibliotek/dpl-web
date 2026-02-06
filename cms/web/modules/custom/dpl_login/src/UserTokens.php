<?php

namespace Drupal\dpl_login;

use Drupal\Component\DependencyInjection\ContainerInterface;

/**
 * Handles logic around registered and unregistered user tokens.
 */
class UserTokens {

  /**
   * {@inheritdoc}
   */
  public function __construct(
    protected UserTokensProviderInterface $registeredUserTokensProvider,
    protected UserTokensProviderInterface $unregisteredUserTokensProvider,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      $container->get('dpl_login.registered_user_tokens'),
      $container->get('dpl_login.unregistered_user_tokens')
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

    return NULL;
  }

}
