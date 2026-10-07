<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_po\Unit;

use Drupal\Tests\UnitTestCase;
use Drupal\dpl_po\Gettext\PoCombiner;
use Drupal\dpl_po\Gettext\PoMessage;
use Psr\Log\NullLogger;

/**
 * Test case for bringing the committed combined file up to date with a scan.
 */
class PoCombinerTest extends UnitTestCase {

  /**
   * The combiner under test.
   */
  protected PoCombiner $combiner;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->combiner = new PoCombiner(new NullLogger());
  }

  /**
   * A message with a translation.
   */
  protected function message(string $source, string $translation = '', string $context = ''): PoMessage {
    return new PoMessage($context, $source, NULL, [$translation]);
  }

  /**
   * The sources of the messages, in order.
   *
   * @param \Drupal\dpl_po\Gettext\PoMessage[] $messages
   *   The messages.
   *
   * @return string[]
   *   Their sources.
   */
  protected function sources(array $messages): array {
    return array_map(fn (PoMessage $message): string => $message->source, $messages);
  }

  /**
   * The committed order is kept, new messages are appended, gone ones dropped.
   */
  public function testOrderIsKeptWithNewMessagesAppended(): void {
    $committed = [
      $this->message('zebra', 'zebra'),
      $this->message('apple', 'æble'),
      $this->message('removed', 'fjernet'),
      $this->message('mango', 'mango'),
    ];
    $scanned = [
      $this->message('apple'),
      $this->message('banana'),
      $this->message('mango'),
      $this->message('cherry'),
      $this->message('zebra'),
    ];

    $combined = $this->combiner->combine($committed, $scanned);

    $this->assertSame(['zebra', 'apple', 'mango', 'banana', 'cherry'], $this->sources($combined));
  }

  /**
   * The committed translation wins over the one the scan found.
   *
   * The committed file is what POEditor last exported, so it holds what the
   * translators decided.
   */
  public function testCommittedTranslationWins(): void {
    $committed = [$this->message('apple', 'æble')];
    $scanned = [$this->message('apple', 'et æble')];

    [$apple] = $this->combiner->combine($committed, $scanned);

    $this->assertSame(['æble'], $apple->translations);
  }

  /**
   * The scanned translation is used where the committed file has none.
   */
  public function testScannedTranslationFillsAnUntranslatedMessage(): void {
    $committed = [$this->message('apple')];
    $scanned = [$this->message('apple', 'æble')];

    [$apple] = $this->combiner->combine($committed, $scanned);

    $this->assertSame(['æble'], $apple->translations);
  }

  /**
   * The flags are those of the committed file, as POEditor sets them.
   */
  public function testCommittedFlagsAreKept(): void {
    $committed = [new PoMessage('', 'apple', NULL, ['æble'], ['fuzzy'])];
    $scanned = [$this->message('apple', 'æble')];

    [$apple] = $this->combiner->combine($committed, $scanned);

    $this->assertSame(['fuzzy'], $apple->flags);
  }

  /**
   * A translation is only carried over to the same number of forms.
   */
  public function testTranslationIsNotCarriedWhenPluralityChanges(): void {
    $committed = [$this->message('1 apple', '1 æble')];
    $scanned = [new PoMessage('', '1 apple', '@count apples', ['', ''])];

    [$apple] = $this->combiner->combine($committed, $scanned);

    $this->assertSame('@count apples', $apple->plural);
    $this->assertSame(['', ''], $apple->translations);
  }

  /**
   * A scanned message with Windows line breaks matches the committed one.
   */
  public function testWindowsLineBreaksMatchTheCommittedMessage(): void {
    $committed = [$this->message("Dear reader,\nWelcome", "Kære læser,\nVelkommen")];
    $scanned = [$this->message("Dear reader,\r\nWelcome")];

    [$message] = $this->combiner->combine($committed, $scanned);

    $this->assertSame("Dear reader,\nWelcome", $message->source);
    $this->assertSame(["Kære læser,\nVelkommen"], $message->translations);
  }

  /**
   * Messages are told apart by context, and the first scan to hold one wins.
   */
  public function testContextSeparatesMessagesAndFirstScanWins(): void {
    $scanned = [
      $this->message('Other', 'Andet'),
      $this->message('Other', 'Anden', 'Gender'),
      $this->message('Other', 'Øvrige'),
    ];

    $combined = $this->combiner->combine([], $scanned);

    $this->assertCount(2, $combined);
    $this->assertSame(['Andet'], $combined[0]->translations);
    $this->assertSame('Gender', $combined[1]->context);
  }

  /**
   * The header is the committed one, and comes first.
   */
  public function testCommittedHeaderComesFirst(): void {
    $committedHeader = new PoMessage('', '', NULL, ["X-Generator: POEditor.com\n"]);
    $scannedHeader = new PoMessage('', '', NULL, ["POT-Creation-Date: 2026-10-06 14:13+0200\n"]);
    $committed = [$committedHeader, $this->message('apple', 'æble')];
    $scanned = [$scannedHeader, $this->message('banana'), $this->message('apple')];

    $combined = $this->combiner->combine($committed, $scanned);

    $this->assertEquals($committedHeader, $combined[0]);
    $this->assertSame(['', 'apple', 'banana'], $this->sources($combined));
  }

  /**
   * Without a committed file, the scan is the result, header included.
   */
  public function testScanIsTheResultWhenNothingIsCommitted(): void {
    $header = new PoMessage('', '', NULL, ["POT-Creation-Date: 2026-10-06 14:13+0200\n"]);
    $scanned = [$header, $this->message('banana'), $this->message('apple')];

    $combined = $this->combiner->combine([], $scanned);

    $this->assertEquals($header, $combined[0]);
    $this->assertSame(['', 'banana', 'apple'], $this->sources($combined));
  }

}
