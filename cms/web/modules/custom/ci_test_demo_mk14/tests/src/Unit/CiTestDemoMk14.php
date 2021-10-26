<?php

namespace Drupal\Tests\ci_test_demo_mk14\Unit;

use Drupal\Tests\UnitTestCase;

/**
 * Unit tests proving that the phpUnit setup works.
 *
 * @group ci_test_demo_mk14
 */
class CiTestDemoMk14 extends UnitTestCase {

  /**
   * Test that the phpUnit setup works.
   */
  public function testExpectedOutputFromRandomFunction(): void {
    $this->assertEquals('I guess phpUnit works!', 'I guess phpUnit works!');
  }

}
