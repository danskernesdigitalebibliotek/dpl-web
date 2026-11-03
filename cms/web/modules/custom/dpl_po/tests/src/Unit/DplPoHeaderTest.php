<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_po\Unit;

use Drupal\Tests\UnitTestCase;
use Drupal\dpl_po\DplPoHeader;

/**
 * Test case for the header of the .po files we generate.
 */
class DplPoHeaderTest extends UnitTestCase {

  /**
   * The header carries nothing that changes from one run to the next.
   *
   * The combined file is committed whenever it differs, so anything that does
   * would turn every run into a change.
   */
  public function testHeaderIsTheSameOnEveryRun(): void {
    $header = (string) new DplPoHeader('da');

    $this->assertDoesNotMatchRegularExpression('/\d{4}-\d{2}-\d{2}/', $header);
    $this->assertSame($header, (string) new DplPoHeader('da'));
  }

  /**
   * The header carries the Danish plural formula.
   *
   * Drupal stores the formula from the header of a file it imports, so a wrong
   * one changes which form every plural string uses.
   */
  public function testHeaderHasDanishPluralFormula(): void {
    $this->assertStringContainsString(
      '"Plural-Forms: nplurals=2; plural=(n != 1);\n"',
      (string) new DplPoHeader('da'),
    );
  }

  /**
   * A language without a known plural formula is refused.
   */
  public function testUnknownLanguageIsRefused(): void {
    $this->expectException(\InvalidArgumentException::class);

    new DplPoHeader('xx');
  }

}
