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
    $userinfo['sub'] = $this->getSubIdFromUserInfo($response);

    return $userinfo;
  }

  /**
   *
   */
  public function getSubIdFromUserInfo(array $userinfo): string {
    $identifier_data = $this->getIdentifierDataFromUserInfo($userinfo);
    return $this->hashIdentifier($identifier_data['id']);
  }

  /**
   *
   */
  public function getIdentifierDataFromUserInfo(array $userinfo): array {
    $cpr = $userinfo['attributes']['cpr'] ?? FALSE;
    $unique_id = $userinfo['attributes']['uniqueId'] ?? FALSE;

    if (!$cpr && !$unique_id) {
      throw new \Exception('Unable to identify user. Both CPR and uniqueId are missing.');
    }

    if ($unique_id) {
      $id = $unique_id;
      $type = AuthorizationIdType::UNIQUE_ID;
    }

    if ($cpr) {
      $id = $cpr;
      $type = AuthorizationIdType::CPR;
    }

    return ['id' => $id, 'type' => $type];
  }

  /**
   *
   */
  public function hashIdentifier(string $identifier): string {
    return crypt($identifier, sprintf('$5$%s', $this->settings::getHashSalt()));
  }

}
