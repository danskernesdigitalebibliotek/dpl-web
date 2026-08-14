<?php

declare(strict_types=1);

namespace Drupal\dpl_po\Commands;

use Drupal\Component\Gettext\PoHeader;
use Drupal\Component\Gettext\PoItem;
use Drupal\Component\Gettext\PoStreamWriter;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\locale\PluralFormulaInterface;
use Drupal\locale\StringStorageInterface;
use Drush\Attributes\Argument;
use Drush\Attributes\Command;
use Drush\Attributes\Help;
use Drush\Attributes\Usage;
use Drush\Commands\DrushCommands;
use function Safe\file;

/**
 * Drush command for scanning our source code for translatable strings.
 *
 * The extraction is done by the potx module, driven through its API rather
 * than its own `drush potx` command, which writes template files of its own
 * shape in a place of its own choosing. Potx is used for what it is good at -
 * finding translatable strings in source code - and nothing else: its build
 * stage is skipped. Translations come from locale.storage and the file is
 * written with the same core Gettext components the rest of this module uses.
 * That makes a malformed file impossible by construction rather than
 * something to correct after the fact: PoItem escapes every string it writes,
 * and a collection keyed by context and msgid cannot hold the same message
 * twice.
 */
class ScanSourceCommands extends DrushCommands {

  /**
   * The places our own code lives, relative to the Drupal root.
   */
  protected const OWN_CODE_DIRECTORIES = [
    'modules/custom',
    'themes/custom',
    'profiles/dpl_cms',
  ];

  /**
   * The file listing the contrib projects we scan alongside our own code.
   *
   * Relative to the dpl_po module directory.
   */
  protected const CONTRIB_PROJECTS_FILE = 'scanned_modules.txt';

  /**
   * Class constructor.
   */
  public function __construct(
    protected string $appRoot,
    protected LanguageManagerInterface $languageManager,
    protected ModuleHandlerInterface $moduleHandler,
    protected StringStorageInterface $localeStorage,
    protected PluralFormulaInterface $pluralFormula,
  ) {
    parent::__construct();
  }

  /**
   * Scan the source code for translatable strings and write them to a file.
   *
   * The strings are written together with the translations already held in
   * the database, so the result is a complete .po file rather than an empty
   * template.
   *
   * @param string $langcode
   *   The langcode to export translations for. Eg. 'da'.
   * @param string $destination
   *   Path of the .po file to write, relative to the Drupal root.
   */
  #[Command(name: 'dpl_po:scan-source')]
  #[Help(description: 'Scan the source code for translatable strings and write them, with the translations we already have, to a .po file.')]
  #[Argument(name: 'langcode', description: 'The langcode to export translations for. Eg. "da".')]
  #[Argument(name: 'destination', description: 'Path of the .po file to write, relative to the Drupal root.')]
  #[Usage(
    name: 'drush dpl_po:scan-source da profiles/dpl_cms/translations/da.po',
    description: 'Scan the source code and write Danish strings and translations to da.po.'
  )]
  public function scanSource(string $langcode, string $destination): void {
    if (!$this->moduleHandler->moduleExists('potx')) {
      throw new \RuntimeException('The potx module is required for scanning but is not enabled.');
    }
    $this->moduleHandler->loadInclude('potx', 'inc');
    $this->moduleHandler->loadInclude('potx', 'inc', 'potx.local');

    // An uninstalled language has no translations in locale.storage, so the
    // scan would silently produce an untranslated template.
    if (!array_key_exists($langcode, $this->languageManager->getLanguages())) {
      throw new \RuntimeException(sprintf('The language "%s" is not installed. Refusing to scan: the result would be an untranslated template.', $langcode));
    }

    $path = $this->appRoot . '/' . $destination;
    if (!is_writable(dirname($path))) {
      throw new \RuntimeException(sprintf('The directory of "%s" is not writable.', $destination));
    }

    $files = $this->findFiles();
    if (empty($files)) {
      throw new \RuntimeException('Found no files to scan. Refusing to write an empty file.');
    }

    $count = $this->scanFiles($files, $langcode, $path);

    $this->io()->success(sprintf('Scanned %d files. Wrote %d strings to %s.', count($files), $count, $destination));
  }

  /**
   * Scan the given files and write the .po file.
   *
   * The pipeline behind the command, minus file discovery, argument guards
   * and CLI output. Public so the kernel test can drive it against fixture
   * files; Drush only exposes methods with a Command attribute.
   *
   * @param string[] $files
   *   Absolute paths of the files to scan.
   * @param string $langcode
   *   The langcode to export translations for.
   * @param string $path
   *   Absolute path of the .po file to write.
   *
   * @return int
   *   The number of strings written.
   */
  public function scanFiles(array $files, string $langcode, string $path): int {
    // Loaded in scanSource() too, which needs potx for file discovery before
    // getting here. Repeating is harmless - loadInclude() is include_once.
    $this->moduleHandler->loadInclude('potx', 'inc');
    $this->moduleHandler->loadInclude('potx', 'inc', 'potx.local');

    $strings = $this->extract($files);
    $this->reportProblems();

    $items = $this->buildItems($strings, $langcode);
    if (empty($items)) {
      throw new \RuntimeException('The scan produced no strings. Refusing to write an empty file.');
    }

    $this->write($items, $langcode, $path);

    return count($items);
  }

  /**
   * The directories to scan, relative to the Drupal root.
   *
   * Our own code is covered by directory. Some of our modules only run on
   * some sites - bnf_client and bnf_server on the BNF site, dpl_webmaster on
   * webmaster sites - and their strings need translating whether or not the
   * site doing the scan happens to have them turned on.
   *
   * Contrib is covered by the curated list. Core is left out either way; its
   * translations come from localize.drupal.org.
   *
   * @return string[]
   *   Directory paths relative to the Drupal root.
   */
  protected function scanDirectories(): array {
    $directories = self::OWN_CODE_DIRECTORIES;

    foreach ($this->contribProjects() as $project) {
      $directories[] = 'modules/contrib/' . $project;
    }

    return $directories;
  }

  /**
   * The contrib projects to scan, as listed in scanned_modules.txt.
   *
   * The list is not a considered selection of the projects worth translating.
   * It was added in 33cc8d770 because Potion crashed on some modules, and
   * naming what to include was the safe way to stop a newly added module
   * breaking the workflow without it being obvious why. Potx does not crash, so
   * that reason is gone - but dropping the list widens the file from around
   * 6,000 terms to around 13,400, which is a decision about what we ask
   * translators to work on rather than a technical one. It is left for later.
   *
   * @return string[]
   *   Directory names below modules/contrib.
   */
  protected function contribProjects(): array {
    $module = $this->moduleHandler->getModule('dpl_po')->getPath();
    $path = $this->appRoot . '/' . $module . '/' . self::CONTRIB_PROJECTS_FILE;
    if (!is_file($path)) {
      throw new \RuntimeException(sprintf('Cannot read the list of contrib projects to scan: %s', $path));
    }

    $projects = array_map('trim', file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES));

    return array_filter($projects);
  }

  /**
   * Find the files to scan across all the directories we cover.
   *
   * @return string[]
   *   Absolute paths of the files to scan.
   */
  protected function findFiles(): array {
    $files = [];
    foreach ($this->scanDirectories() as $directory) {
      $path = $this->appRoot . '/' . $directory;
      if (!is_dir($path)) {
        $this->logger()?->warning(sprintf('Skipping %s: the directory does not exist.', $directory));
        continue;
      }

      // Potx expects a trailing slash and returns the files it knows how to
      // scan, recursively.
      $found = _potx_explore_dir($path . '/', '*', POTX_API_CURRENT, TRUE);
      $this->logger()?->info(sprintf('Found %d files in %s.', count($found), $directory));
      $files = array_merge($files, $found);
    }

    return array_unique($files);
  }

  /**
   * Run the files through potx' extractors and return what they found.
   *
   * Potx hands what it finds to its save callback rather than returning it,
   * and calling that callback with a NULL value is its API for reading the
   * collected strings back out - it is how _potx_build_files() gets them too.
   * Potx keeps runtime and installer strings apart; we want both in one file.
   *
   * The strings come back keyed by msgid, then context ('' for none), then
   * the files each one was found in. Msgids carry the c-style escapes potx
   * added on extraction, and a plural string is a single msgid holding its
   * singular and plural form joined by a null byte:
   * @code
   * [
   *   'Plain string' => [
   *     '' => ['/app/web/modules/custom/foo/foo.module' => ['12']],
   *   ],
   *   "1 item\0@count items" => [
   *     'Item lists' => ['/app/web/modules/custom/foo/foo.module' => ['34']],
   *   ],
   * ]
   * @endcode
   *
   * @param string[] $files
   *   Absolute paths of the files to scan.
   *
   * @return array<string|int, array<string, array<string, list<int|string>>>>
   *   The extracted strings. A purely numeric msgid like t('1') is an integer
   *   key, since PHP casts it. Line numbers are strings for runtime strings,
   *   where potx may append a marker ("34 (dup)"), and integers for installer
   *   strings.
   */
  protected function extract(array $files): array {
    // Collect problems rather than printing them as they are found, and keep
    // the file and line separate from the message so we can tell ours from
    // contrib's afterwards.
    potx_status('set', POTX_STATUS_STRUCTURED);

    // Lets potx find the modules and config schemas of the installation it is
    // scanning. Any path within the Drupal root will do.
    potx_local_init($this->appRoot . '/modules/');

    foreach ($files as $file) {
      // Potx types $strip_prefix as a string in its doc comment, but describes
      // it as, and uses it as, a number of characters to cut off the file
      // path. Its own drush command passes 0 here as well.
      // @phpstan-ignore argument.type
      _potx_process_file($file, 0, '_potx_save_string', '_potx_save_version', POTX_API_CURRENT);
    }
    potx_finish_processing('_potx_save_string', POTX_API_CURRENT);

    $strings = [];
    foreach ([POTX_STRING_RUNTIME, POTX_STRING_INSTALLER] as $string_mode) {
      $collection = _potx_save_string(NULL, NULL, NULL, 0, $string_mode);
      if (!is_array($collection)) {
        continue;
      }
      foreach ($collection as $string => $contexts) {
        // Merged by hand: a purely numeric string like t('1') is an integer
        // array key to PHP, and array_merge() renumbers integer keys - the
        // msgid would come out as "0".
        $strings[$string] = ($strings[$string] ?? []) + $contexts;
      }
    }

    return $strings;
  }

  /**
   * Turn the extracted strings into translated PO items.
   *
   * The items are keyed by context and singular msgid, which is how gettext
   * identifies a message. Potx keys a plural string by both of its forms, so
   * a string reached through both formatPlural() and t() arrives here twice -
   * the keying folds them into one, and the plural entry wins because its
   * first form carries the singular translation.
   *
   * @param array<string|int, array<string, array<string, list<int|string>>>> $strings
   *   The extracted strings, as extract() returns them.
   * @param string $langcode
   *   The langcode to export translations for.
   *
   * @return \Drupal\Component\Gettext\PoItem[]
   *   The items to write, ordered by context and msgid.
   */
  protected function buildItems(array $strings, string $langcode): array {
    $entries = [];
    foreach ($strings as $string => $contexts) {
      // Potx delimits the singular and plural form with a null byte and
      // stores both with c-style escapes; PoItem does its own escaping.
      $sources = array_map('stripcslashes', explode("\0", (string) $string));
      $plural = count($sources) > 1;

      foreach (array_keys($contexts) as $context) {
        $context = stripcslashes((string) $context);
        $existing = $entries[$context][$sources[0]] ?? NULL;
        if ($existing !== NULL && ($existing['plural'] || !$plural)) {
          continue;
        }
        $entries[$context][$sources[0]] = ['sources' => $sources, 'plural' => $plural];
      }
    }

    ksort($entries);

    $translations = $this->translationMap($langcode);
    // Doc-typed as int, but once a .po import has run it returns the string
    // that PoHeader::parsePluralForms() substr()'ed out of the header.
    $nplurals = (int) $this->pluralFormula->getNumberOfPlurals($langcode);

    $items = [];
    foreach ($entries as $context => $messages) {
      ksort($messages);
      foreach ($messages as $entry) {
        // Locale storage keys a plural string the way PoItem delimits it.
        $source = implode(PoItem::DELIMITER, $entry['sources']);
        $translation = $translations[$context][$source] ?? '';

        $item = new PoItem();
        $item->setLangcode($langcode);
        $item->setContext($context);
        if ($entry['plural']) {
          $item->setPlural(TRUE);
          $item->setSource($entry['sources']);
          // Gettext requires every msgstr[n] up to nplurals, translated or
          // not.
          $forms = $translation === '' ? [] : explode(PoItem::DELIMITER, $translation);
          $item->setTranslation(array_pad($forms, $nplurals, ''));
        }
        else {
          $item->setSource($source);
          $item->setTranslation($translation);
        }
        $items[] = $item;
      }
    }

    return $items;
  }

  /**
   * The translations we already have, keyed by context and source.
   *
   * @return array<string, array<string, string>>
   *   Translation strings keyed by context and then source. Plural sources
   *   and translations are delimiter-joined, as locale storage holds them.
   */
  protected function translationMap(string $langcode): array {
    $map = [];
    foreach ($this->localeStorage->getTranslations(['language' => $langcode, 'translated' => TRUE]) as $string) {
      $values = $string->getValues(['context', 'source', 'translation']);
      $map[(string) ($values['context'] ?? '')][(string) ($values['source'] ?? '')] = (string) ($values['translation'] ?? '');
    }

    return $map;
  }

  /**
   * Write the items to the destination as a .po file.
   *
   * @param \Drupal\Component\Gettext\PoItem[] $items
   *   The items to write.
   * @param string $langcode
   *   The langcode the items are translated to.
   * @param string $path
   *   Absolute path of the .po file to write.
   */
  protected function write(array $items, string $langcode, string $path): void {
    $header = new PoHeader($langcode);
    $header->setLanguageName($this->languageManager->getLanguage($langcode)?->getName() ?? $langcode);
    $header->setProjectName('DPL CMS');
    // PoHeader defaults to the English plural formula. Potx knows the right
    // one per language, and setFromString() is the only way to set it.
    $header->setFromString(sprintf('Plural-Forms: nplurals=%d; plural=%s;', $this->pluralFormula->getNumberOfPlurals($langcode), _potx_get_plural_form($langcode)));

    $writer = new PoStreamWriter();
    $writer->setLangcode($langcode);
    $writer->setHeader($header);
    $writer->setURI($path);
    $writer->open();
    foreach ($items as $item) {
      $writer->writeItem($item);
    }
    $writer->close();
  }

  /**
   * Report the problems potx ran into while scanning.
   *
   * Potx complains about every t() call it cannot read a literal string out
   * of. Contrib is full of those and they are not ours to fix, so they are
   * only counted - pass -v to see them. Problems in our own code mean a
   * string is not going to reach POEditor, so those are named.
   */
  protected function reportProblems(): void {
    $problems = potx_status('get');
    if (empty($problems)) {
      return;
    }

    $ours = 0;
    foreach ($problems as [$message, $file, $line]) {
      $text = sprintf('%s In %s on line %s.', strip_tags((string) $message), $file ?? 'an unknown file', $line ?? '?');

      if ($this->isOwnCode((string) $file)) {
        $ours++;
        $this->logger()?->warning($text);
      }
      else {
        $this->logger()?->info($text);
      }
    }

    $this->logger()?->notice(sprintf('Potx reported %d problems while scanning, %d of them in our own code.', count($problems), $ours));
  }

  /**
   * Whether a scanned file is part of our own code rather than contrib.
   */
  protected function isOwnCode(string $file): bool {
    foreach (self::OWN_CODE_DIRECTORIES as $directory) {
      if (str_starts_with($file, $this->appRoot . '/' . $directory . '/')) {
        return TRUE;
      }
    }

    return FALSE;
  }

}
