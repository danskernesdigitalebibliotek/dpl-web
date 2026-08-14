<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_po\Unit;

use Drupal\Tests\UnitTestCase;
use Drupal\dpl_po\PoFileBuilder;
use Psr\Log\NullLogger;

/**
 * Test case for the work the source scan does on top of potx.
 *
 * The scan itself needs a Drupal installation with potx enabled and a database
 * of translations to fill in, so it is not what is covered here. What is
 * covered is the two things we do that potx does not: dropping the plain
 * strings a plural string already defines, and turning potx' output into the
 * .po file we hand to POEditor.
 */
class PoFileBuilderTest extends UnitTestCase {

  /**
   * The builder under test.
   */
  protected PoFileBuilder $builder;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->builder = new PoFileBuilder(new NullLogger());
  }

  /**
   * A plain string is dropped when a plural string defines the same singular.
   */
  public function testShadowedPlainStringIsDropped(): void {
    // Potx delimits the two forms of a plural string with a null byte, and
    // keys every string by context below that.
    $strings = [
      "1 month\0@count months" => ['' => ['facets.php' => [10]]],
      '1 month' => ['' => ['purge.module' => [17]]],
    ];

    $this->assertSame(
      ["1 month\0@count months" => ['' => ['facets.php' => [10]]]],
      $this->builder->removeShadowedPlurals($strings),
    );
  }

  /**
   * A plain string in another context is left alone.
   *
   * A .po file identifies a message by its context and singular together, so
   * two entries that differ in context are two messages and neither shadows
   * the other.
   */
  public function testPlainStringInAnotherContextIsKept(): void {
    $strings = [
      "1 month\0@count months" => ['' => ['facets.php' => [10]]],
      '1 month' => ['Global' => ['dpl_event.module' => [42]]],
    ];

    $this->assertSame($strings, $this->builder->removeShadowedPlurals($strings));
  }

  /**
   * The rendered file is a translation, not the template potx builds.
   */
  public function testRenderedFileDropsPotxTemplateMarkup(): void {
    $built = [
      'header' => "# --VERSIONS--\n#\n#, fuzzy\nmsgid \"\"\nmsgstr \"\"\n\n",
      'strings' => "#: some/file.php:12\nmsgid \"Hello\"\nmsgstr \"Hej\"\n\n",
    ];

    $rendered = $this->builder->render($built);

    $this->assertStringNotContainsString('--VERSIONS--', $rendered);
    $this->assertStringNotContainsString('#, fuzzy', $rendered);
    $this->assertStringNotContainsString('#: some/file.php', $rendered);
    $this->assertStringContainsString("msgid \"Hello\"\nmsgstr \"Hej\"", $rendered);
  }

}
