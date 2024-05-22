<?php

namespace Drupal\dpl_login;

use Drupal\Core\Site\Settings;

/**
 * Access Token.
 */
class OpenIdUserInfoService {

  /**
   *
   */
  public function __construct(
    private Settings $settings
  ) {}

  /**
   *
   */
  public function getOpenIdUserInfoFromAdgangsplatformenUserInfoResponse(array $response): array {
    $name = uniqid();
    // Drupal needs an email. We set a unique one to apply to that rule.
    $userinfo['email'] = sprintf('%s@dpl-cms.invalid', $name);
    // Drupal needs a username. We use the unique id to apply to that rule.
    $userinfo['name'] = $name;
    // openid_connect module needs the sub for creating the auth map.
    $userinfo['sub'] = $this->getSubHashFromUserInfo($response);

    return $userinfo;
  }

  /**
   *
   */
  public function getSubHashFromUserInfo(array $userinfo): string {
    if (!$cpr = $userinfo['attributes']['cpr'] ?? FALSE) {
      if (!$uniqueId = $userinfo['attributes']['uniqueId'] ?? FALSE) {
        throw new \Exception('Unable to identify user. Both CPR and uniqueId are missing.');
      }
    }

    $id = $cpr ?: $uniqueId;
    return $this->hashIdentifier($id);
  }

  /**
   *
   */
  public function hashIdentifier(string $identifier): string {
    return crypt($identifier, $this->settings::getHashSalt());
  }

}
