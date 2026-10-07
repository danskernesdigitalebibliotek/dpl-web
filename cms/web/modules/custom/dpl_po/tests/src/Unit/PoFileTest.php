<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_po\Unit;

use Drupal\Tests\UnitTestCase;
use Drupal\dpl_po\Gettext\PoFile;
use Drupal\dpl_po\Gettext\PoMessage;

/**
 * Test case for reading and writing the combined file in POEditor's layout.
 */
class PoFileTest extends UnitTestCase {

  /**
   * A file as POEditor exports it.
   *
   * It covers what POEditor writes: the header one field per line, an empty
   * reference before every message, a flag, a context, a plural, a string
   * split at its line breaks with the first part on the keyword line and an
   * empty last part, and the escapes.
   */
  protected const POEDITOR_FILE = <<<'PO'
msgid ""
msgstr ""
"MIME-Version: 1.0\n"
"Content-Type: text/plain; charset=UTF-8\n"
"X-Generator: POEditor.com\n"
"Plural-Forms: nplurals=2; plural=(n != 1);\n"

#: 
msgctxt "Loan list"
msgid "Digital loans"
msgstr "Digitale lån"

#: 
#, fuzzy
msgctxt "field.field.node.page.field_hero_title:label"
msgid "Hero title"
msgstr "Overskrift"

#: 
msgid "1 reaction rule updated"
msgid_plural "@count reaction rules updated"
msgstr[0] "1 reaktionsregel opdateret"
msgstr[1] "@count reaktionsregler opdateret"

#: 
msgid "Set Duration"
msgstr "Indstil varighed\n"
""

#: 
msgid "\n"
"<p>Say \"hello\"\twith a backslash \\ and a tab</p>\n"
"  "
msgstr ""

PO;

  /**
   * A file written by POEditor reads and writes back byte for byte.
   */
  public function testPoeditorFileRoundTrips(): void {
    // Every message is followed by a blank line, the last one too, which the
    // heredoc cannot show.
    $file = self::POEDITOR_FILE . "\n";

    $this->assertSame($file, PoFile::render(PoFile::parse($file)));
  }

  /**
   * The parts of a message are read as they are meant.
   */
  public function testMessagesAreRead(): void {
    $messages = PoFile::parse(self::POEDITOR_FILE);

    $this->assertCount(6, $messages);

    $header = $messages[0];
    $this->assertTrue($header->isHeader());
    $this->assertStringContainsString("X-Generator: POEditor.com\n", $header->translations[0]);

    $this->assertSame('Loan list', $messages[1]->context);
    $this->assertSame('Digital loans', $messages[1]->source);
    $this->assertSame(['Digitale lån'], $messages[1]->translations);

    $this->assertSame(['fuzzy'], $messages[2]->flags);

    $this->assertSame('@count reaction rules updated', $messages[3]->plural);
    $this->assertSame(['1 reaktionsregel opdateret', '@count reaktionsregler opdateret'], $messages[3]->translations);

    $this->assertSame(["Indstil varighed\n"], $messages[4]->translations);

    $this->assertSame("\n<p>Say \"hello\"\twith a backslash \\ and a tab</p>\n  ", $messages[5]->source);
    $this->assertFalse($messages[5]->isTranslated());
  }

  /**
   * A file written by gettext is read, and written back in POEditor's layout.
   *
   * Gettext wraps long lines, starts a multi-line string with an empty part
   * and writes source references, which the combined file has none of.
   */
  public function testGettextFileIsReadAndRewritten(): void {
    $gettext = <<<'PO'
# Danish translation of Drupal (general)
#
#, fuzzy
msgid ""
msgstr ""
"Project-Id-Version: PROJECT VERSION\n"
"POT-Creation-Date: 2026-10-06 14:13+0200\n"

#: modules/custom/dpl_loans/dpl_loans.module:12
msgctxt "Loan list"
msgid ""
"You will be charged a fee, when the item is returned to the library after "
"the due date"
msgstr ""
"Du opkræves et gebyr, når materialet afleveres til biblioteket efter "
"afleveringsfristen"

#~ msgid "Gone"
#~ msgstr "Væk"

msgid "Dear [user:display-name],\n"
"\n"
"Welcome"
msgstr ""

PO;

    $expected = <<<'PO'
# Danish translation of Drupal (general)
#
#, fuzzy
msgid ""
msgstr ""
"Project-Id-Version: PROJECT VERSION\n"
"POT-Creation-Date: 2026-10-06 14:13+0200\n"

#: 
msgctxt "Loan list"
msgid "You will be charged a fee, when the item is returned to the library after the due date"
msgstr "Du opkræves et gebyr, når materialet afleveres til biblioteket efter afleveringsfristen"

#: 
msgid "Dear [user:display-name],\n"
"\n"
"Welcome"
msgstr ""

PO;

    $this->assertSame($expected . "\n", PoFile::render(PoFile::parse($gettext)));
  }

  /**
   * An obsolete entry is left out, also when a message follows it directly.
   */
  public function testObsoleteEntryIsLeftOut(): void {
    $messages = PoFile::parse("#~ msgid \"Gone\"\n#~ msgstr \"Væk\"\nmsgid \"Kept\"\nmsgstr \"Beholdt\"\n");

    $this->assertSame(['Kept'], array_map(fn ($message) => $message->source, $messages));
  }

  /**
   * A continuation line must be a quoted string to the end of the line.
   */
  public function testUnquotedContinuationLineIsReported(): void {
    $this->expectException(\RuntimeException::class);
    $this->expectExceptionMessage('line 2');

    PoFile::parse("msgid \"a\"\n\"b\" \nmsgstr \"\"\n");
  }

  /**
   * A line that is not .po syntax is reported with its number.
   */
  public function testUnreadableLineIsReported(): void {
    $this->expectException(\RuntimeException::class);
    $this->expectExceptionMessage('line 3');

    PoFile::parse("msgid \"a\"\nmsgstr \"b\"\nnot po\n");
  }

  /**
   * A message is identified by its context and source.
   */
  public function testKey(): void {
    $plain = new PoMessage('', 'Other', NULL, ['']);
    $inContext = new PoMessage('Loan list', 'Other', NULL, ['']);

    $this->assertNotSame($plain->key(), $inContext->key());
    $this->assertSame($plain->key(), (new PoMessage('', 'Other', NULL, ['Andet']))->key());
  }

}
