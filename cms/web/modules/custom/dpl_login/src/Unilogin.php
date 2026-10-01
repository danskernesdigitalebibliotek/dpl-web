<?php

declare(strict_types=1);

namespace Drupal\dpl_login;

/**
 * Recognises and authorizes Unilogin users logging in via Adgangsplatformen.
 *
 * Adgangsplatformen can use Unilogin as identity provider. The Unilogin
 * attributes then come back in the userinfo, next to the usual ones.
 */
final class Unilogin {

  /**
   * The value of the idp parameter on /login that forces Unilogin.
   */
  const IDP = 'unilogin';

  /**
   * The Adgangsplatformen identity provider for Unilogin.
   */
  const ADGANGSPLATFORMEN_IDP = 'unilogin_oidc';

  // Claim names as seen in a real login.bib.dk response for a Unilogin login.
  const CLAIM_IDP_USED = 'idpUsed';
  const CLAIM_UNI_ID = 'uniloginUniId';
  const CLAIM_HAS_LICENSE = 'uniloginHasLicense';
  // A comma separated string in brackets, "[ABC111,CDA222]", or "" for none.
  const CLAIM_INSTITUTION_IDS = 'uniloginInstitutionIds';
  // The agency id of the main library in the municipality of the user's
  // institution, e.g. "710100" for a school in Copenhagen.
  const CLAIM_AGENCY_ID = 'uniloginAgencyId';

  /**
   * Institutions of DDF test users, allowed regardless of municipality.
   */
  const TEST_INSTITUTION_IDS = ['R00263'];

  // Reasons for denying a Unilogin user.
  const DENIED_NOT_UNILOGIN = 'not a Unilogin user';
  const DENIED_NO_LICENSE = 'no license';
  const DENIED_NO_INSTITUTION = 'no institution';
  const DENIED_MUNICIPALITY = 'first institution not in the municipality of the library';

  /**
   * Get the uni-id of the user, if the user logged in with Unilogin.
   *
   * @param mixed[] $userinfo
   *   The userinfo from the Adgangsplatformen userinfo endpoint.
   */
  public static function getUniId(array $userinfo): ?string {
    $uni_id = $userinfo['attributes'][self::CLAIM_UNI_ID] ?? NULL;

    return is_string($uni_id) && $uni_id !== '' ? $uni_id : NULL;
  }

  /**
   * Did the user log in with Unilogin?
   *
   * @param mixed[] $userinfo
   *   The userinfo from the Adgangsplatformen userinfo endpoint.
   */
  public static function isUniloginUser(array $userinfo): bool {
    return ($userinfo['attributes'][self::CLAIM_IDP_USED] ?? NULL) === self::ADGANGSPLATFORMEN_IDP
      || self::getUniId($userinfo) !== NULL;
  }

  /**
   * Get the institution ids of the user.
   *
   * The claim is a comma separated string in brackets, "[ABC111,CDA222]", or
   * an empty string. An array is accepted too.
   *
   * @param mixed[] $userinfo
   *   The userinfo from the Adgangsplatformen userinfo endpoint.
   *
   * @return string[]
   *   The institution ids.
   */
  public static function getInstitutionIds(array $userinfo): array {
    $claim = $userinfo['attributes'][self::CLAIM_INSTITUTION_IDS] ?? [];
    $ids = is_string($claim) ? explode(',', trim($claim, '[]')) : (array) $claim;

    return array_values(array_filter(array_map(
      fn ($id) => trim((string) $id),
      $ids,
    ), fn (string $id) => $id !== ''));
  }

  /**
   * Why may the Unilogin user not log in at this library?
   *
   * The user must have a license and an institution, and the first
   * institution of the user must either be a test institution or belong to
   * the municipality of the library. Loans are made through the first
   * institution, so only that one counts.
   *
   * @param mixed[] $userinfo
   *   The userinfo from the Adgangsplatformen userinfo endpoint.
   * @param string|null $agency_id
   *   The agency id of the library.
   *
   * @return string|null
   *   The reason for denying the user, or NULL if the user may log in.
   */
  public static function getDenialReason(array $userinfo, ?string $agency_id): ?string {
    if (!self::isUniloginUser($userinfo)) {
      return self::DENIED_NOT_UNILOGIN;
    }

    // A missing license claim denies access. That is the safe default, but it
    // blocks every student if Adgangsplatformen does not pass the claim on.
    $has_license = $userinfo['attributes'][self::CLAIM_HAS_LICENSE] ?? FALSE;
    if ($has_license !== TRUE && $has_license !== 'true') {
      return self::DENIED_NO_LICENSE;
    }

    $institution_ids = self::getInstitutionIds($userinfo);
    if (!$institution_ids) {
      return self::DENIED_NO_INSTITUTION;
    }

    if (in_array($institution_ids[0], self::TEST_INSTITUTION_IDS, TRUE)) {
      return NULL;
    }

    $user_agency_id = $userinfo['attributes'][self::CLAIM_AGENCY_ID] ?? NULL;
    if (empty($agency_id) || (string) $user_agency_id !== $agency_id) {
      return self::DENIED_MUNICIPALITY;
    }

    return NULL;
  }

}
