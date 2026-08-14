<?php

declare(strict_types=1);

namespace Drupal\Tests\dpl_po\Kernel;

use Drupal\Component\Gettext\PoItem;
use Drupal\Component\Gettext\PoStreamReader;
use Drupal\dpl_po\Commands\ScanSourceCommands;
use Drupal\KernelTests\KernelTestBase;
use phpmock\Mock;
use phpmock\MockBuilder;
use function Safe\file_get_contents;
use function Safe\file_put_contents;

/**
 * Tests the source scan against real potx and real locale storage.
 *
 * The scan is built on potx internals - the callback read-back API, the
 * null-byte plural delimiter, the c-style escaping of extracted strings - and
 * on how locale storage keys plural and contexted translations. None of that
 * can be pinned by a unit test: a mocked potx would encode the very
 * assumptions that need verifying. So this test runs the real potx extractors
 * over a fixture file, fills translations from a real locale schema, and
 * parses the written file back with core's Gettext reader.
 */
class ScanSourceTest extends KernelTestBase {

  /**
   * The moment the mocked date() reports: 2026-01-01T00:00:00Z.
   *
   * PoHeader stamps date() straight into the file's header. Mocking it is
   * what makes the header dates - and so the whole file - reproducible.
   */
  public const FROZEN_TIME = 1767225600;

  /**
   * The date() mock for the Gettext component namespace.
   */
  protected Mock $dateMock;

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'language',
    'locale',
    'potx',
    'dpl_po',
    'system',
  ];

  /**
   * The parsed contents of the scanned file, keyed by "context|source".
   *
   * Plural sources are joined by the PoItem delimiter.
   *
   * @var array<string, \Drupal\Component\Gettext\PoItem>
   */
  protected array $items = [];

  /**
   * The raw contents of the scanned file.
   */
  protected string $rawFile = '';

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->installSchema('locale', [
      'locales_source',
      'locales_target',
      'locales_location',
    ]);

    // Potx keeps its state in globals. In production each scan is a fresh
    // Drush process; tests in one process have to do the resetting.
    global $_potx_strings, $_potx_install, $_potx_store;
    $_potx_strings = $_potx_install = $_potx_store = [];

    $this->freezeDate();
    $this->seedTranslations();
    $this->scanFixture();
  }

  /**
   * {@inheritdoc}
   */
  protected function tearDown(): void {
    $this->dateMock->disable();
    parent::tearDown();
  }

  /**
   * Freeze the date() that PoHeader stamps into the file's header.
   */
  protected function freezeDate(): void {
    $builder = new MockBuilder();
    $builder->setNamespace('Drupal\Component\Gettext')
      ->setName('date')
      ->setFunction(static fn (string $format, ?int $timestamp = NULL): string => \date($format, $timestamp ?? self::FROZEN_TIME));
    $this->dateMock = $builder->build();
    $this->dateMock->enable();
  }

  /**
   * The translations the scan should find - and the ones it should not.
   */
  protected function seedTranslations(): void {
    /** @var \Drupal\locale\StringStorageInterface $storage */
    $storage = $this->container->get('locale.storage');

    $translations = [
      ['Plain string', '', 'Almindelig streng'],
      // The same source under two contexts, translated differently. The scan
      // must keep them apart - matching on source alone would leak one
      // context's translation into the other.
      ['Title', '', 'Titel uden kontekst'],
      ['Title', 'Fixture context', 'Titel med kontekst'],
      // Locale storage holds a plural string as one row, both source forms
      // and both translations joined by the PoItem delimiter.
      [
        '1 item' . PoItem::DELIMITER . '@count items',
        '',
        '1 ting' . PoItem::DELIMITER . '@count ting',
      ],
    ];

    foreach ($translations as [$source, $context, $translation]) {
      $string = $storage->createString([
        'source' => $source,
        'context' => $context,
      ]);
      $string->save();
      $storage->createTranslation([
        'lid' => $string->getId(),
        'language' => 'da',
        'translation' => $translation,
      ])->save();
    }
  }

  /**
   * Run the fixture file through the scan and parse the result back.
   */
  protected function scanFixture(): void {
    $command = $this->command();

    $path = $this->siteDirectory . '/scan-test.po';
    $command->scanFiles([__DIR__ . '/../../fixtures/potx_scan_fixture.module'], 'da', $path);
    $this->rawFile = file_get_contents($path);

    $reader = new PoStreamReader();
    $reader->setLangcode('da');
    $reader->setURI($path);
    $reader->open();
    while ($item = $reader->readItem()) {
      $source = $item->getSource();
      $key = is_array($source) ? implode(PoItem::DELIMITER, $source) : $source;
      $this->items[$item->getContext() . '|' . $key] = $item;
    }
  }

  /**
   * The message with the given source and context, from the scanned file.
   *
   * Fails the test when the message is absent, so callers can use the result
   * without checking - and cannot mistype the composite key by hand.
   *
   * @param string|string[] $source
   *   The source string, or its singular and plural form for a plural.
   * @param string $context
   *   The message context, if any.
   */
  protected function item(string|array $source, string $context = ''): PoItem {
    $key = $this->key($source, $context);
    $this->assertArrayHasKey($key, $this->items, sprintf('The scanned file holds no message "%s".', $key));

    return $this->items[$key];
  }

  /**
   * The key a message is held under in $this->items.
   *
   * @param string|string[] $source
   *   The source string, or its singular and plural form for a plural.
   * @param string $context
   *   The message context, if any.
   */
  protected function key(string|array $source, string $context = ''): string {
    return $context . '|' . implode(PoItem::DELIMITER, (array) $source);
  }

  /**
   * Strings extracted by potx come out with their translations filled in.
   */
  public function testTranslationsAreFilledIn(): void {
    $this->assertSame('Almindelig streng', $this->item('Plain string')->getTranslation());
    $this->assertSame('', $this->item('Untranslated string')->getTranslation());
  }

  /**
   * A contexted string only gets the translation made for that context.
   */
  public function testContextsAreKeptApart(): void {
    $this->assertSame('Titel uden kontekst', $this->item('Title')->getTranslation());
    $this->assertSame('Titel med kontekst', $this->item('Title', 'Fixture context')->getTranslation());
  }

  /**
   * Plural translations are found under locale storage's joined key.
   */
  public function testPluralTranslationsAreFilledIn(): void {
    $item = $this->item(['1 item', '@count items']);
    $this->assertTrue((bool) $item->isPlural());
    $this->assertSame(['1 ting', '@count ting'], $item->getTranslation());
  }

  /**
   * A string reached through both t() and formatPlural() is one message.
   *
   * Potx records the two separately. Written out naively they would be the
   * same msgid twice, which gettext refuses to read.
   */
  public function testPluralShadowsPlainString(): void {
    $this->assertArrayNotHasKey($this->key('1 item'), $this->items);
  }

  /**
   * An untranslated plural still carries every msgstr[n] gettext requires.
   */
  public function testUntranslatedPluralIsPadded(): void {
    $item = $this->item(['1 untranslated', '@count untranslated']);
    $this->assertTrue((bool) $item->isPlural());
    $this->assertSame(['', ''], $item->getTranslation());
  }

  /**
   * Quotes and newlines survive the trip through potx' escaping and back.
   *
   * Potx stores extracted strings with c-style escapes; the scan has to undo
   * them before core's Gettext components apply their own.
   */
  public function testEscapedStringsRoundTrip(): void {
    $this->item("It's a \"quoted\"\nstring");
  }

  /**
   * The header declares the Danish plural rule, not PoHeader's default.
   */
  public function testHeaderCarriesPluralForms(): void {
    $this->assertStringContainsString('Plural-Forms: nplurals=2; plural=(n != 1);', $this->rawFile);
  }

  /**
   * Annotations that only our patched potx extracts still arrive.
   *
   * Both behaviors live in patches/potx-translation-annotations.patch. A potx
   * upgrade can rework the patch, or apply it without it taking effect - this
   * is what fails when the behavior is lost rather than the patch file.
   */
  public function testPatchedAnnotationExtraction(): void {
    $this->item('Annotated label');
    // An annotation carrying an arguments parameter. Stock potx fails the
    // match and drops the string.
    $this->item('Has arguments.');
    // A wrapped annotation keeps its newline and continuation, since that is
    // the string Drupal's annotation parser looks up at runtime. It has to
    // arrive escaped: raw, it takes the whole file with it.
    $this->item("An annotation wrapped\n *   over two lines");
  }

  /**
   * The translate() calls that only our patched potx scans still arrive.
   *
   * From patches/potx-scan-translationinterface-translate.patch, which is
   * deliberately not filed upstream - see its header.
   */
  public function testPatchedTranslateExtraction(): void {
    $this->item('Injected translate call');
  }

  /**
   * A purely numeric string keeps its msgid.
   *
   * PHP turns "404" into an integer array key, and integer keys get renumbered
   * by functions like array_merge() - the msgid came out as "0" once.
   */
  public function testNumericStringsKeepTheirMsgid(): void {
    $this->item('404');
  }

  /**
   * The file carries none of the noise potx' own build stage would add.
   *
   * Source references churn whenever code moves, and a fuzzy flag marks the
   * file as a template rather than a translation. Both are absent by
   * construction today - this pins the requirement against a rework.
   */
  public function testFileCarriesNoPotxArtifacts(): void {
    $this->assertStringNotContainsString('#:', $this->rawFile);
    $this->assertStringNotContainsString('#, fuzzy', $this->rawFile);
  }

  /**
   * The whole file matches the committed reference, byte for byte.
   *
   * The named tests pin individual requirements; this pins everything they
   * cannot enumerate - ordering, wrapping, header layout - the way the
   * committed translation file would experience a change. Nothing is masked:
   * the header dates are pinned by the mocked date().
   *
   * When a change to the output is intended, regenerate the reference:
   * DPL_PO_UPDATE_REFERENCE=1 phpunit --filter testOutputMatchesReference ...
   */
  public function testOutputMatchesReference(): void {
    $reference = __DIR__ . '/../../fixtures/potx_scan_fixture.po';

    if (getenv('DPL_PO_UPDATE_REFERENCE')) {
      file_put_contents($reference, $this->rawFile);
    }

    $this->assertSame(file_get_contents($reference), $this->rawFile);
  }

  /**
   * A scan that produces no strings refuses to write anything.
   *
   * An empty file would wipe every translation two workflow steps later.
   */
  public function testRefusesToWriteWithoutStrings(): void {
    global $_potx_strings, $_potx_install, $_potx_store;
    $_potx_strings = $_potx_install = $_potx_store = [];

    $path = $this->siteDirectory . '/scan-empty.po';
    $this->expectException(\RuntimeException::class);
    $this->expectExceptionMessage('produced no strings');
    $this->command()->scanFiles([__DIR__ . '/../../fixtures/potx_scan_empty_fixture.module'], 'da', $path);
  }

  /**
   * The command under test, built from the container's services.
   */
  protected function command(): ScanSourceCommands {
    return new ScanSourceCommands(
      (string) $this->container->getParameter('app.root'),
      $this->container->get('language_manager'),
      $this->container->get('module_handler'),
      $this->container->get('locale.storage'),
      $this->container->get('locale.plural.formula'),
    );
  }

}
