<?php

declare(strict_types=1);

namespace Drupal\dpl_po\Commands;

use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drush\Attributes\Argument;
use Drush\Attributes\Command;
use Drush\Attributes\Help;
use Drush\Attributes\Usage;
use Drush\Commands\DrushCommands;
use function Safe\file;
use function Safe\file_put_contents;
use function Safe\preg_match;
use function Safe\preg_replace;

/**
 * Drush command for scanning our source code for translatable strings.
 *
 * The extraction itself is done by the potx module. Potx ships a `drush potx`
 * command, but it scans one directory per invocation and writes the result to
 * a hardcoded file name in the current directory. We scan a number of
 * directories into a single file, so we drive the potx API directly instead.
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
   * Relative to the project root, which is the directory above the Drupal root.
   */
  protected const CONTRIB_PROJECTS_FILE = 'dev-scripts/translate-source/scanned_modules.txt';

  /**
   * The name potx files its strings under while we build the output.
   *
   * Potx groups strings into one or more output files. We want a single file,
   * so everything is collected under one name.
   */
  protected const POTX_FILE_NAME = 'general';

  /**
   * Class constructor.
   */
  public function __construct(
    protected string $appRoot,
    protected LanguageManagerInterface $languageManager,
    protected ModuleHandlerInterface $moduleHandler,
  ) {
    parent::__construct();
  }

  /**
   * Scan the source code for translatable strings and write them to a file.
   *
   * The strings are written together with the translations already held in the
   * database, so the result is a complete .po file rather than an empty
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

    // Potx validates the language against the installed languages and silently
    // ignores it when it does not match. That produces an untranslated
    // template, which would wipe every translation from the result.
    if (!array_key_exists($langcode, $this->languageManager->getLanguages())) {
      throw new \RuntimeException(sprintf('The language "%s" is not installed. Refusing to scan: potx would silently emit an untranslated template.', $langcode));
    }

    $path = $this->appRoot . '/' . $destination;
    if (!is_writable(dirname($path))) {
      throw new \RuntimeException(sprintf('The directory of "%s" is not writable.', $destination));
    }

    $files = $this->findFiles();
    if (empty($files)) {
      throw new \RuntimeException('Found no files to scan. Refusing to write an empty file.');
    }

    $strings = $this->extractStrings($files, $langcode);
    if (empty($strings)) {
      throw new \RuntimeException('The scan produced no strings. Refusing to write an empty file.');
    }
    $this->assertReadable($strings);

    file_put_contents($path, $strings);

    $this->io()->success(sprintf('Scanned %d files. Wrote %s.', count($files), $destination));
  }

  /**
   * The directories to scan, relative to the Drupal root.
   *
   * Our own code is covered by directory. Some of our modules only run on some
   * sites - bnf_client and bnf_server on the BNF site, dpl_webmaster on
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
    $path = dirname($this->appRoot) . '/' . self::CONTRIB_PROJECTS_FILE;
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
   * Escape the strings potx hands over unescaped.
   *
   * Potx runs almost everything it extracts through
   * _potx_format_quoted_string(), which escapes control characters. Its
   * `@Translation` extractor is the exception: it saves the raw regex match. An
   * annotation wrapped over two lines therefore arrives with a real newline and
   * the doc comment's continuation in it:
   *
   * @code
   *   description = @Translation("Sends emails through the Azure Communication
   *   Service")
   * @endcode
   *
   * Written out as-is that is not a .po file at all, and gettext throws away
   * every term in it rather than the one string. One module with a wrapped
   * annotation would take the whole translation file with it.
   *
   * Only strings that still hold a raw control character are touched, so the
   * ones potx escaped properly are left exactly as they are.
   */
  protected function escapeUnescapedStrings(): void {
    global $_potx_strings, $_potx_install;

    $escaped = 0;
    foreach ([&$_potx_strings, &$_potx_install] as &$store) {
      if (!is_array($store)) {
        continue;
      }

      $result = [];
      foreach ($store as $string => $contexts) {
        $clean = $this->escapeString((string) $string);
        if ($clean !== (string) $string) {
          $escaped++;
        }

        // Escaping can land a string on one that is already there, so the
        // occurrences are merged rather than overwritten.
        $result[$clean] = array_merge_recursive($result[$clean] ?? [], $contexts);
      }
      $store = $result;
    }

    if ($escaped > 0) {
      $this->logger()?->info(sprintf('Escaped %d strings that potx handed over raw.', $escaped));
    }
  }

  /**
   * Escape one extracted string for a .po file.
   */
  protected function escapeString(string $string): string {
    // Potx delimits the two forms of a plural string with a null byte. Each
    // form is escaped on its own so the delimiter survives.
    $forms = explode("\0", $string);

    foreach ($forms as $index => $form) {
      if (preg_match('/[\x00-\x1F]/', $form) !== 1) {
        continue;
      }

      // Fold a doc comment continuation back into a single space, so the msgid
      // is the string the author wrote rather than the source layout.
      $form = preg_replace('~[ \t]*\R[ \t]*\*[ \t]*~', ' ', $form);

      // The annotation pattern cannot capture a quote, so control characters
      // are all that is left to deal with.
      $forms[$index] = addcslashes($form, "\0..\37");
    }

    return implode("\0", $forms);
  }

  /**
   * Drop plain strings that a plural string already defines.
   *
   * Potx keys a plural string by its singular and plural form together, and a
   * plain string by itself, so "1 month" from a formatPlural() call and
   * "1 month" from a t() call are two entries to potx. A .po file identifies a
   * message by its context and singular alone, so the two come out as one
   * message defined twice and gettext refuses the file.
   *
   * The plural entry is the one to keep - its first form is the singular
   * translation, so nothing is lost by dropping the plain one.
   *
   * The old scan hid this: it wrote a file per directory and combined them with
   * "msgcat --use-first", which quietly kept whichever came first.
   */
  protected function removeShadowedPlurals(): void {
    global $_potx_strings;

    $dropped = 0;
    foreach ($_potx_strings as $string => $contexts) {
      // Potx delimits the singular and plural form with a null byte.
      if (!str_contains((string) $string, "\0")) {
        continue;
      }

      [$singular] = explode("\0", (string) $string);
      foreach (array_keys($contexts) as $context) {
        if (isset($_potx_strings[$singular][$context])) {
          unset($_potx_strings[$singular][$context]);
          $dropped++;
        }
      }

      if (isset($_potx_strings[$singular]) && empty($_potx_strings[$singular])) {
        unset($_potx_strings[$singular]);
      }
    }

    if ($dropped > 0) {
      $this->logger()?->info(sprintf('Dropped %d plain strings that a plural string already defines.', $dropped));
    }
  }

  /**
   * Refuse to write a file that gettext will not read.
   *
   * Potx does not escape everything it extracts, so a single string can leave
   * the whole file unusable - a raw newline inside a msgid gives "end-of-line
   * within string" and gettext then discards every term. That only surfaces two
   * steps later, when the file is merged with the configuration translations,
   * long after the offending string could still be named.
   *
   * @throws \RuntimeException
   *   When a line holds a string gettext cannot read.
   */
  protected function assertReadable(string $po): void {
    foreach (explode("\n", $po) as $index => $line) {
      $starts_a_string = preg_match('/^(?:msgid|msgid_plural|msgctxt|msgstr(?:\[\d+\])?)\s+"|^"/', $line) === 1;

      if ($starts_a_string && !str_ends_with($line, '"')) {
        throw new \RuntimeException(sprintf('Line %d leaves a string unterminated, which would make the whole file unusable: %s', $index + 1, $line));
      }

      if (preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', $line) === 1) {
        throw new \RuntimeException(sprintf('Line %d holds an unescaped control character: %s', $index + 1, $line));
      }
    }
  }

  /**
   * Run the files through potx and return the contents of the .po file.
   *
   * @param string[] $files
   *   Absolute paths of the files to scan.
   * @param string $langcode
   *   The langcode to export translations for.
   */
  protected function extractStrings(array $files, string $langcode): string {
    // Potx collects the strings it has built into this global, keyed by output
    // file name.
    global $_potx_store;
    $_potx_store = [];

    // Collect problems rather than printing them as they are found, and keep
    // the file and line separate from the message so we can tell ours from
    // contrib's afterwards.
    potx_status('set', POTX_STATUS_STRUCTURED);

    // Lets potx find the modules and config schemas of the installation it is
    // scanning. Any path within the Drupal root will do.
    potx_local_init($this->appRoot . '/modules/');

    foreach ($files as $file) {
      // Potx types $strip_prefix as a string in its doc comment, but describes
      // it as, and uses it as, a number of characters to cut off the file path.
      // Its own drush command passes 0 here as well.
      // @phpstan-ignore argument.type
      _potx_process_file($file, 0, '_potx_save_string', '_potx_save_version', POTX_API_CURRENT);
    }
    potx_finish_processing('_potx_save_string', POTX_API_CURRENT);

    $this->escapeUnescapedStrings();
    $this->removeShadowedPlurals();

    // Potx keeps runtime strings and installer strings apart. We want both, so
    // both are built under the same name and end up in the same file.
    // Passing the langcode as the last two arguments is what makes potx write
    // a Danish file and fill in the translations from the database. Without the
    // second one we would get an empty template.
    foreach ([POTX_STRING_RUNTIME, POTX_STRING_INSTALLER] as $string_mode) {
      _potx_build_files($string_mode, POTX_BUILD_SINGLE, self::POTX_FILE_NAME, '_potx_save_string', '_potx_save_version', '_potx_get_header', $langcode, $langcode, POTX_API_CURRENT);
    }

    $this->reportProblems();

    // Potx fills the store through the callbacks above rather than by
    // returning anything, so what it holds now has to be stated here.
    /** @var array<string, array{header: string, strings: string}> $store */
    $store = $_potx_store;

    if (!isset($store[self::POTX_FILE_NAME])) {
      return '';
    }

    return $this->render($store[self::POTX_FILE_NAME]);
  }

  /**
   * Turn what potx built into the contents of a .po file.
   *
   * This is potx' own _potx_write_files(), which we cannot use as it writes to
   * a hardcoded file name in the current directory, plus the adjustments we
   * need for the file we hand to POEditor.
   *
   * @param array{header: string, strings: string} $built
   *   One entry of the potx output store.
   */
  protected function render(array $built): string {
    $header = $built['header'];

    // Potx leaves a placeholder in the header for a list of the files it found
    // strings in, meant for recording module versions when publishing a
    // template to localize.drupal.org. We scan a git checkout, so every entry
    // would read "n/a" - a thousand lines of noise that churn whenever a file
    // moves. Say where the file came from instead.
    $header = str_replace('--VERSIONS--', 'Generated by "drush dpl_po:scan-source". Do not edit by hand.', $header);

    // Potx marks the header fuzzy, which is the convention for a template. What
    // we produce is a complete translation file. The header is the only place
    // potx sets the flag, and the file is built from scratch on every run, so
    // there are no per-string flags to preserve.
    $header = str_replace("#, fuzzy\n", '', $header);

    // Drop the "#:" source references. They would add thousands of lines to the
    // committed file and churn whenever code moves, and POEditor does not need
    // them - it identifies a string by its context and source text.
    $strings = preg_replace('/^#:[^\n]*\n/m', '', $built['strings']);

    return $header . $strings;
  }

  /**
   * Report the problems potx ran into while scanning.
   *
   * Potx complains about every t() call it cannot read a literal string out
   * of. Contrib is full of those and they are not ours to fix, so they are
   * only counted - pass -v to see them. Problems in our own code mean a string
   * is not going to reach POEditor, so those are named.
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

    $this->io()->note(sprintf('Potx reported %d problems while scanning, %d of them in our own code.', count($problems), $ours));
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
