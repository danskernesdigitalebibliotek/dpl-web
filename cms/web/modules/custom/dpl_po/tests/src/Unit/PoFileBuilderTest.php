<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_po\Unit;

use Drupal\Tests\UnitTestCase;
use Drupal\dpl_po\PoFileBuilder;

/**
 * Test case for the work the source scan does on top of potx.
 *
 * The scan itself needs a Drupal installation with potx enabled and a database
 * of translations to fill in, so it is not what is covered here. What is
 * covered is the three things we do that potx does not: dropping the plain
 * strings a plural string already defines, turning potx' output into the .po
 * file we hand to POEditor, and refusing to pass on a file gettext cannot
 * read.
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

    $this->builder = new PoFileBuilder();
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

  /**
   * A file gettext can read is passed on.
   */
  public function testReadableFileIsAccepted(): void {
    $this->expectNotToPerformAssertions();

    $this->builder->assertGettextReads($this->po([
      "msgid \"Hello\"\nmsgstr \"Hej\"\n",
    ]));
  }

  /**
   * A message defined twice is refused rather than passed on.
   */
  public function testDuplicateMessageIsRefused(): void {
    $this->expectException(\RuntimeException::class);
    $this->expectExceptionMessageMatches('/duplicate message definition/');

    $this->builder->assertGettextReads($this->po([
      "msgid \"1 month\"\nmsgid_plural \"@count months\"\nmsgstr[0] \"1 måned\"\nmsgstr[1] \"@count måneder\"\n",
      "msgid \"1 month\"\nmsgstr \"1 måned\"\n",
    ]));
  }

  /**
   * A string left unterminated is refused rather than passed on.
   *
   * This is what an unescaped newline in a msgid looks like from gettext's
   * side, and it costs the whole file rather than the one message.
   */
  public function testUnterminatedStringIsRefused(): void {
    $this->expectException(\RuntimeException::class);
    $this->expectExceptionMessageMatches('/end-of-line within string/');

    $this->builder->assertGettextReads($this->po([
      "msgid \"Sends emails through an external\nservice\"\nmsgstr \"\"\n",
    ]));
  }

  /**
   * Wrap message entries in the header a .po file needs to be read at all.
   *
   * @param string[] $entries
   *   The entries to wrap, each ending on a newline.
   */
  protected function po(array $entries): string {
    $header = <<<'HEADER'
    msgid ""
    msgstr ""
    "MIME-Version: 1.0\n"
    "Content-Type: text/plain; charset=utf-8\n"
    "Content-Transfer-Encoding: 8bit\n"
    "Plural-Forms: nplurals=2; plural=(n != 1);\n"

    HEADER;

    return $header . "\n" . implode("\n", $entries);
  }

}
