<?php

namespace Drupal\Tests\dpl_mail\Unit;

use Drupal\dpl_mail\Config\AzureMailerConfigOverrides;
use Drupal\Tests\UnitTestCase;

/**
 * Unit tests for Azure Mailer.
 */
class AzureMailerConnectionTest extends UnitTestCase {

  /**
   * We want to see if we can parse a Azure Mailer connection string.
   */
  public function testThatWeGetaProperConfigStructureFromAzureMailerEnvSetting(): void {
    $settings = (new AzureMailerConfigOverrides())->getAzureMailerSettings();
    $this->assertEquals(
     $settings,
      [
        'azure_mailer.settings' =>
        [
          'endpoint' => 'something.something.azure.com',
          'secret' => 'someThing9999/p+somethinG9999==',
        ],
      ]
    );
  }

}
