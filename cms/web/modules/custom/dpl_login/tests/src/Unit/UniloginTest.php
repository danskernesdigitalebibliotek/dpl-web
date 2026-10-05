<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_login\Unit;

use Drupal\dpl_login\Unilogin;
use Drupal\Tests\UnitTestCase;

/**
 * Unit tests for recognising and authorizing Unilogin users.
 *
 * @covers \Drupal\dpl_login\Unilogin
 */
class UniloginTest extends UnitTestCase {

  const AGENCY_ID = '710100';

  /**
   * A real login.bib.dk userinfo response for an unlicensed user, fake ids.
   *
   * @return mixed[]
   *   The userinfo.
   */
  protected static function realUnlicensedUserinfo(): array {
    return [
      'attributes' => [
        'serviceStatus' => ['borchk' => 'ok', 'culr' => 'ok'],
        'cpr' => NULL,
        'userId' => 'a1b2c3d4e5f6',
        'idpUsed' => 'unilogin_oidc',
        'agencies' => [],
        'municipality' => NULL,
        'uniloginUniId' => 'elev4821',
        'uniloginUserType' => 'Elev',
        'uniloginUniIdHash' => '9f8e7d6c5b4a3f2e1d0c',
        'uniloginHasLicense' => FALSE,
        'municipalityAgencyId' => NULL,
        'uniloginInstitutionIds' => '',
        'uniloginMunicipality' => NULL,
        'uniloginAgencyId' => NULL,
        'loggedInAgencyId' => '190101',
      ],
    ];
  }

  /**
   * A real login.bib.dk userinfo response for a licensed student, fake ids.
   *
   * @return mixed[]
   *   The userinfo.
   */
  protected static function realStudentUserinfo(): array {
    return [
      'attributes' => [
        'serviceStatus' => ['borchk' => 'ok', 'culr' => 'ok'],
        'cpr' => NULL,
        'userId' => 'f6e5d4c3b2a1',
        'idpUsed' => 'unilogin_oidc',
        'agencies' => [],
        'municipality' => NULL,
        'uniloginUniId' => 'elev7350',
        'uniloginUserType' => 'Elev',
        'uniloginUniIdHash' => '1a2b3c4d5e6f7a8b9c0d',
        'uniloginHasLicense' => TRUE,
        'municipalityAgencyId' => NULL,
        'uniloginInstitutionIds' => '[101047]',
        'uniloginAgencyId' => '710100',
      ],
    ];
  }

  /**
   * Build an Adgangsplatformen userinfo response for a Unilogin user.
   *
   * @param mixed[] $attributes
   *   Attributes overriding the defaults.
   *
   * @return mixed[]
   *   The userinfo.
   */
  protected static function userinfo(array $attributes = []): array {
    return [
      'attributes' => $attributes + [
        Unilogin::CLAIM_IDP_USED => Unilogin::ADGANGSPLATFORMEN_IDP,
        Unilogin::CLAIM_UNI_ID => 'abcd1234',
        Unilogin::CLAIM_HAS_LICENSE => TRUE,
        Unilogin::CLAIM_INSTITUTION_IDS => 'A12345',
        Unilogin::CLAIM_AGENCY_ID => self::AGENCY_ID,
      ],
    ];
  }

  /**
   * Unilogin users are recognised by the identity provider used.
   *
   * @param mixed[] $userinfo
   *   The userinfo.
   * @param bool $expected
   *   Whether the userinfo belongs to a Unilogin user.
   *
   * @dataProvider provideUserinfo
   */
  public function testIsUniloginUser(array $userinfo, bool $expected): void {
    $this->assertSame($expected, Unilogin::isUniloginUser($userinfo));
  }

  /**
   * Test cases for testIsUniloginUser.
   *
   * @return array<string, array{mixed[], bool}>
   *   Userinfo and whether it belongs to a Unilogin user.
   */
  public static function provideUserinfo(): array {
    return [
      'Unilogin user' => [self::userinfo(), TRUE],
      'Real response for an unlicensed user' => [self::realUnlicensedUserinfo(), TRUE],
      'Real response for a licensed student' => [self::realStudentUserinfo(), TRUE],
      'Unilogin identity provider without uni-id' => [
        ['attributes' => [Unilogin::CLAIM_IDP_USED => Unilogin::ADGANGSPLATFORMEN_IDP]],
        TRUE,
      ],
      'Uni-id without identity provider' => [['attributes' => [Unilogin::CLAIM_UNI_ID => 'abcd1234']], TRUE],
      'Patron' => [
        ['attributes' => ['cpr' => '1234567890', 'uniqueId' => 'x', Unilogin::CLAIM_IDP_USED => 'nemlogin']],
        FALSE,
      ],
      'Empty uni-id' => [['attributes' => [Unilogin::CLAIM_UNI_ID => '']], FALSE],
      'No attributes' => [[], FALSE],
    ];
  }

  /**
   * The uni-id is read from the userinfo.
   */
  public function testGetUniId(): void {
    $this->assertSame('abcd1234', Unilogin::getUniId(self::userinfo()));
    $this->assertNull(Unilogin::getUniId(['attributes' => ['cpr' => '1234567890']]));
  }

  /**
   * The institution ids come as a string, and are parsed into a list.
   *
   * @param mixed $claim
   *   The value of the institution ids claim.
   * @param string[] $expected
   *   The expected institution ids.
   *
   * @dataProvider provideInstitutionIds
   */
  public function testGetInstitutionIds(mixed $claim, array $expected): void {
    $userinfo = ['attributes' => [Unilogin::CLAIM_INSTITUTION_IDS => $claim]];
    $this->assertSame($expected, Unilogin::getInstitutionIds($userinfo));
  }

  /**
   * Test cases for testGetInstitutionIds.
   *
   * @return array<string, array{mixed, string[]}>
   *   Claim value and the expected institution ids.
   */
  public static function provideInstitutionIds(): array {
    return [
      'Empty string' => ['', []],
      'Single id' => ['A12345', ['A12345']],
      'Comma separated' => ['R00263,A12345', ['R00263', 'A12345']],
      'Comma separated with spaces' => ['R00263, A12345', ['R00263', 'A12345']],
      'Bracketed' => ['[R00263,A12345]', ['R00263', 'A12345']],
      'Confirmed format' => ['[ABC111,CDA222,B4333]', ['ABC111', 'CDA222', 'B4333']],
      'Empty entries' => ['[, R00263, ,]', ['R00263']],
      'Null' => [NULL, []],
    ];
  }

  /**
   * Only licensed users from the library's municipality are authorized.
   *
   * @param mixed[] $userinfo
   *   The userinfo.
   * @param string|null $agency_id
   *   The agency id of the library.
   * @param string|null $expected
   *   Why the user is denied, or NULL if the user is authorized.
   *
   * @dataProvider provideAuthorizationCases
   */
  public function testGetDenialReason(array $userinfo, ?string $agency_id, ?string $expected): void {
    $this->assertSame($expected, Unilogin::getDenialReason($userinfo, $agency_id));
  }

  /**
   * Test cases for testGetDenialReason.
   *
   * @return array<string, array{mixed[], ?string, ?string}>
   *   Userinfo, agency id of the library and the expected denial reason.
   */
  public static function provideAuthorizationCases(): array {
    $no_license = Unilogin::DENIED_NO_LICENSE;
    $municipality = Unilogin::DENIED_MUNICIPALITY;
    return [
      'Licensed user from the municipality' => [self::userinfo(), self::AGENCY_ID, NULL],
      'Real response for a licensed student' => [self::realStudentUserinfo(), self::AGENCY_ID, NULL],
      'Real response for a licensed student at another library' => [
        self::realStudentUserinfo(),
        '715100',
        $municipality,
      ],
      'Real response for an unlicensed user' => [self::realUnlicensedUserinfo(), self::AGENCY_ID, $no_license],
      'License given as a string' => [
        self::userinfo([Unilogin::CLAIM_HAS_LICENSE => 'true']),
        self::AGENCY_ID,
        NULL,
      ],
      'No license' => [self::userinfo([Unilogin::CLAIM_HAS_LICENSE => FALSE]), self::AGENCY_ID, $no_license],
      'No license given as a string' => [
        self::userinfo([Unilogin::CLAIM_HAS_LICENSE => 'false']),
        self::AGENCY_ID,
        $no_license,
      ],
      'License claim missing' => [
        ['attributes' => array_diff_key(self::userinfo()['attributes'], [Unilogin::CLAIM_HAS_LICENSE => TRUE])],
        self::AGENCY_ID,
        $no_license,
      ],
      'Other municipality' => [
        self::userinfo([Unilogin::CLAIM_AGENCY_ID => '715100']),
        self::AGENCY_ID,
        $municipality,
      ],
      'Agency claim missing' => [
        ['attributes' => array_diff_key(self::userinfo()['attributes'], [Unilogin::CLAIM_AGENCY_ID => TRUE])],
        self::AGENCY_ID,
        $municipality,
      ],
      'Agency id of the library missing' => [self::userinfo(), NULL, $municipality],
      'No institution' => [
        self::userinfo([Unilogin::CLAIM_INSTITUTION_IDS => '']),
        self::AGENCY_ID,
        Unilogin::DENIED_NO_INSTITUTION,
      ],
      'Institution claim missing' => [
        ['attributes' => array_diff_key(self::userinfo()['attributes'], [Unilogin::CLAIM_INSTITUTION_IDS => TRUE])],
        self::AGENCY_ID,
        Unilogin::DENIED_NO_INSTITUTION,
      ],
      'Test institution from another municipality' => [
        self::userinfo([
          Unilogin::CLAIM_INSTITUTION_IDS => 'R00263,A12345',
          Unilogin::CLAIM_AGENCY_ID => '715100',
        ]),
        self::AGENCY_ID,
        NULL,
      ],
      'Test institution first in the confirmed format' => [
        self::userinfo([
          Unilogin::CLAIM_INSTITUTION_IDS => '[R00263,ABC111]',
          Unilogin::CLAIM_AGENCY_ID => '715100',
        ]),
        self::AGENCY_ID,
        NULL,
      ],
      'Test institution last in the confirmed format' => [
        self::userinfo([
          Unilogin::CLAIM_INSTITUTION_IDS => '[ABC111,R00263]',
          Unilogin::CLAIM_AGENCY_ID => '715100',
        ]),
        self::AGENCY_ID,
        $municipality,
      ],
      // Loans go through the first institution, so only that one counts.
      'Test institution that is not the first institution' => [
        self::userinfo([
          Unilogin::CLAIM_INSTITUTION_IDS => 'A12345,R00263',
          Unilogin::CLAIM_AGENCY_ID => '715100',
        ]),
        self::AGENCY_ID,
        $municipality,
      ],
      'Test institution without agency id of the library' => [
        self::userinfo([Unilogin::CLAIM_INSTITUTION_IDS => '[R00263]']),
        NULL,
        NULL,
      ],
      'Test institution without license' => [
        self::userinfo([
          Unilogin::CLAIM_INSTITUTION_IDS => 'R00263',
          Unilogin::CLAIM_HAS_LICENSE => FALSE,
        ]),
        self::AGENCY_ID,
        $no_license,
      ],
      'Not a Unilogin user' => [
        ['attributes' => ['cpr' => '1234567890']],
        self::AGENCY_ID,
        Unilogin::DENIED_NOT_UNILOGIN,
      ],
    ];
  }

}
