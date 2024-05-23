<?php

namespace Drupal\Tests\dpl_login\Unit;

use Drupal\Core\Site\Settings;
use Drupal\dpl_login\AuthorizationIdType;
use Drupal\dpl_login\OpenIdUserInfoService;
use Drupal\Tests\UnitTestCase;

/**
 * Unit test for the Adgangsplatformen configuration.
 *
 * @covers \Drupal\dpl_login\Adgangsplatformen\Config
 */
class OpenIdAuthMapTest extends UnitTestCase {
  private Settings $settings;

  /**
   * {@inheritdoc}
   */
  public function setUp(): void {
    parent::setUp();

    $settings = [];
    $settings['hash_salt'] = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    $this->settings = new Settings($settings);

  }

  /**
   * @dataProvider cprHasPrecedenceOverUniqueIdData
   */
  public function testHashCreationThatCprHasPrecedenceOverUniqueid(array $userinfo, string $expected_sub_id, AuthorizationIdType $expected_id_type) {
    $service = new OpenIdUserInfoService($this->settings);
    $sub_id = $service->getSubIdFromUserInfo($userinfo);
    $id_type = $service->getIdentifierDataFromUserInfo($userinfo)['type'];

    $this->assertEquals($expected_sub_id, $sub_id);
    $this->assertEquals($expected_id_type, $id_type);
  }

  /**
   *
   */
  public function testThatGettingSubHashFromUserInfoThrowsAnExceptionIfBothCprAndUniqueIdAreMissing() {
    $service = new OpenIdUserInfoService($this->settings);
    $userinfo = [
      'attributes' => [],
    ];
    $this->expectException(\Exception::class);
    $this->expectExceptionMessage('Unable to identify user. Both CPR and uniqueId are missing.');

    $service->getSubIdFromUserInfo($userinfo);
  }

  /**
   * @dataProvider weGetUniqueHashesNotMatterWhatData
   */
  public function testThatHashedCprsAreUnique(string $id_1, string $id_2) {
    $service = new OpenIdUserInfoService($this->settings);
    $hash1 = $service->hashIdentifier($id_1);
    $hash2 = $service->hashIdentifier($id_2);
    $this->assertNotEquals($hash1, $hash2);
  }

  /**
   *
   */
  public function cprHasPrecedenceOverUniqueIdData(): array {
    return [
      'cpr is getting hashed when both cpr and uniqueId are present' => [
        [
          'attributes' => [
            'cpr' => '1234567890',
            'uniqueId' => '9d67c9fa-81d6-41ce-8b42-9d187b306fd9',
          ],
        ],
        '$5$e3b0c44298fc1c14$yd.tasg4wRielbUAUo.AKfcvYplJeAPfXvPBfKxaO47',
        AuthorizationIdType::CPR,
      ],
      'uniqueId is getting hashed when cpr is missing' => [
        [
          'attributes' => [
            'uniqueId' => '9d67c9fa-81d6-41ce-8b42-9d187b306fd9',
          ],
        ],
        '9d67c9fa-81d6-41ce-8b42-9d187b306fd9',
        AuthorizationIdType::UNIQUE_ID,
      ],
    ];
  }

  /**
   *
   */
  public function weGetUniqueHashesNotMatterWhatData(): array {
    return [
      'a pair of cpr that starts with the same character' => [
        '1234567890',
        '1098765432',
      ],
      'a pair of cpr that starts with the same two characters' => [
        '1234567890',
        '1209876543',
      ],
      'a pair of cpr that starts with the same three characters' => [
        '1234567890',
        '1230987654',
      ],
      'a pair of cpr that starts with the same four characters' => [
        '1234567890',
        '1234098765',
      ],
      'a pair of cpr that starts with the same five characters' => [
        '1234567890',
        '1234509876',
      ],
      'a pair of cpr that starts with the same six characters' => [
        '1234567890',
        '1234560987',
      ],
      'a pair of cpr that starts with the same seven characters' => [
        '1234567890',
        '1234567098',
      ],
      'a pair of cpr that starts with the same eight characters' => [
        '1234567890',
        '1234567809',
      ],
      'a pair of cpr that starts with the same nine characters' => [
        '1234567890',
        '1234567891',
      ],
    ];
  }

}
