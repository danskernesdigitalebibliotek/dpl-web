<?php

namespace Drupal\dpl_login;

use Drupal\dpl_login\Exception\AccessTokenCreationException;

/**
 * Access Token.
 */
class AccessToken {
  /**
   * The token.
   *
   * @var string
   */
  public string $token;
  /**
   * Token expiration timestamp.
   *
   * @var int
   */
  public int $expire;

  /**
   * Token type.
   *
   * @var AccessTokenType
   */
  public AccessTokenType $type;

  /**
   * Named constructor that create an Access Token object.
   *
   * From the data of the openid connect context.
   *
   * @param mixed[] $context
   *   The openid connect context.
   *
   * @return AccessToken
   *   Token object created based on a json formed response.
   */
  public static function createFromOpenidConnectContext(array $context): self {
    if (!$access_token = $context['tokens']['access_token'] ?? FALSE) {
      throw new AccessTokenCreationException('Access token is missing');
    }
    if (!$expire = $context['tokens']['expire'] ?? FALSE) {
      throw new AccessTokenCreationException('Expire is missing');
    }

    $token = new static();
    $token->token = $access_token;
    $token->expire = $expire;
    $token->type = AccessTokenType::UNKNOWN;

    return $token;
  }

}
