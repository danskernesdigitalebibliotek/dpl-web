<?php

namespace Drupal\dpl_login;

use Drupal\Core\Site\Settings;

use function Safe\sprintf;

/**
 * OpenIdUserInfoService.
 *
 * Used for handling the userinfo from the adgangsplatformen userinfo endpoint.
 */
class OpenIdUserInfoService {

  /**
   * Constructor.
   */
  public function __construct(
    private Settings $settings
  ) {}

  /**
   * Get the user info from the response.
   *
   * From the adgangsplatformen userinfo endpoint.
   *
   * @param mixed[] $response
   *   The response from the userinfo endpoint.
   *
   * @return array{'email': string, 'name': string, 'sub': string}
   *   The openid_connect user info.
   */
  public function getOpenIdUserInfoFromAdgangsplatformenUserInfoResponse(array $response): array {
    $name = uniqid();
    // Drupal needs an email. We set a unique one to apply to that rule.
    $userinfo['email'] = sprintf('%s@dpl-cms.invalid', $name);
    // Drupal needs a username. We use the unique id to apply to that rule.
    $userinfo['name'] = $name;
    // openid_connect module needs the subject id for creating the auth map.
    $userinfo['sub'] = $this->getSubjectIdFromUserInfo($response);

    return $userinfo;
  }

  /**
   * Get the hashed userinfo id.
   *
   * The openid_connect module uses the sub as the identifier for the authmap.
   *
   * @param mixed[] $userinfo
   *   The userinfo from the adgangsplatformen userinfo endpoint.
   *
   * @see https://openid.net/specs/openid-connect-core-1_0.html#SubjectIDTypes
   *
   * @return string
   *   The hashed openid_connect subject identifier.
   */
  public function getSubjectIdFromUserInfo(array $userinfo): string {
    $identifier_data = $this->getIdentifierDataFromUserInfo($userinfo);
    return $this->hashIdentifier($identifier_data['id']);
  }

  /**
   * Get the identifier data from the userinfo.
   *
   * @param mixed[] $userinfo
   *   The userinfo from the adgangsplatformen userinfo endpoint.
   *
   * @return array{"id": string, "type": AuthorizationIdType}
   *   The identifier data: Raw id and type of id.
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
   * We need a unique identifier for the openid_connect authmap.
   *
   * Since we cannot use the CPR or uniqueId directly as the identifier
   * we hash it with a salt. That way we can still identify the user
   * but the actual identifier is not stored in the database.
   *
   * @param string $identifier
   *   The identifier to hash.
   *
   * @return string
   *   The hashed identifier.
   */
  public function hashIdentifier(string $identifier): string {
    return hash_hmac('sha256', $identifier, $this->settings::getHashSalt());
  }

}
