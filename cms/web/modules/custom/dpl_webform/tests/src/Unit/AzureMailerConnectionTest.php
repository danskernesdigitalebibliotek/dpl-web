<?php

namespace Drupal\Tests\dpl_webform\Unit;

use Drupal\Tests\UnitTestCase;
use function Safe\parse_url;

/**
 * Unit tests for Azure Mailer.
 */
class AzureMailerConnectionTest extends UnitTestCase {

  /**
   * Stub function that is duplicated from real function.
   *
   * @todo Remove this when we have found out how to test
   * a function that belongs to another module.
   *
   * @return mixed[]
   *   Settings.
   */
  protected static function dplCmsGetAzureMailerSettings(): array {
    $config = [];
    if (!$azure_mail_connection_string = getenv('AZURE_MAIL_CONNECTION_STRING')) {
      return $config;
    }

    // Split the connection string by the ';' delimiter.
    $parts = explode(';', $azure_mail_connection_string);
    array_map(function ($element) use (&$config) {
      [$key, $value] = explode('=', $element, 2);
      if ($key === 'endpoint') {
        $value = parse_url($value, PHP_URL_HOST);
      }
      $config['azure_mailer.settings'][$key] = $value;
    }, $parts);

    return $config;
  }

  /**
   * We want to see if we can parse a Azure Mailer connection string.
   */
  public function testThatWeGetaProperConfigStructureFromAzureMailerEnvSetting(): void {
    $settings = self::dplCmsGetAzureMailerSettings();

    $this->assertEquals(
     $settings,
      [
        'azure_mailer.settings' =>
        [
          'endpoint' => 'something.something.azure.com',
          'accesskey' => 'someThing9999/p+somethinG9999==',
        ],
      ]
    );
  }

}
