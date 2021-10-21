<?php

namespace Drupal\dpl_library_token;

use Drupal\dpl_library_token\Exception\LibraryTokenResponseException;

/**
 * Library Token.
 */
class LibraryToken {
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
   * Named constructor that create a Library Token object.
   *
   * From the data of a response body.
   *
   * @param string $response_body
   *   The body of the token request response.
   *
   * @return LibraryToken
   *   Token object created based on a json formed response.
   */
  public static function createFromResponseBody(string $response_body): self {
    // Get token data by decoding json.
    if (!$token_data = json_decode($response_body, TRUE)) {
      throw new LibraryTokenResponseException('Could not decode library token response');
    }
    if (empty($token_data['access_token'])) {
      throw new LibraryTokenResponseException('Access token is missing');
    }
    if (empty($token_data['expires_in'])) {
      throw new LibraryTokenResponseException('Expire is missing');
    }

    $token = new static();
    $token->token = $token_data['access_token'];
    $token->expire = $token_data['expires_in'];

    return $token;
  }

}
