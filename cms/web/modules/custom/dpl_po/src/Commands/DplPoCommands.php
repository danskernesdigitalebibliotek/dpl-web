<?php

namespace Drupal\dpl_po\Commands;

use Drupal\Component\Gettext\PoHeader;
use Drupal\Component\Gettext\PoItem;
use Drupal\Component\Gettext\PoStreamReader;
use Drupal\Component\Gettext\PoStreamWriter;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\File\Exception\FileException;
use Drupal\Core\File\Exception\InvalidStreamWrapperException;
use Drupal\Core\File\FileExists;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\dpl_po\Services\CtpConfigManager;
use Drush\Commands\DrushCommands;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\TransferException;
use function Safe\preg_match;
use function Safe\sprintf;

/**
 * A Drush commandfile.
 */
class DplPoCommands extends DrushCommands {
  use StringTranslationTrait;

  // This context pattern is used to filter the configuration strings in or out.
  // Since the contexts are in the form of 'component.key...' we can use this
  // pattern.
  protected const CONFIG_PO_FILE_CONTEXT_PATTERN = '/^([a-z]+\.)+/';

  /**
   * The source.
   */
  protected string $source;
  /**
   * The destination.
   */
  protected string $destination;
  /**
   * The language code of the proccessed po file.
   */
  protected string $languageCode;

  /**
   * Class constructor.
   */
  public function __construct(
    protected ConfigFactoryInterface $configFactory,
    protected CtpConfigManager $cteiConfigManager,
    protected FileSystemInterface $fileSystem,
    protected ModuleHandlerInterface $moduleHandler,
    protected ClientInterface $httpClient,
  ) {}

  /**
   * Create a .po file with only the configuration strings.
   *
   * @param string $langcode
   *   The langcode to import. Eg. 'en' or 'fr'.
   * @param string $source
   *   The path to the source .po file.
   * @param string $destination
   *   The path to the destination .po file.
   *
   * @command dpl_po:extract-config
   * @usage drush dpl_po:extract-config da da.po
   *   Extracts strings with config context and writes a fie with it.
   */
  public function createPoFileConfigOnly($langcode, $source, $destination): void {
    $this->languageCode = $langcode;
    $this->validateSource($source);
    $this->validateDestination($destination);

    try {
      $file = $this->extractTranslationsIntoFile(self::CONFIG_PO_FILE_CONTEXT_PATTERN, $source, 'include');
      $destination = $this->fileSystem->move($file, $destination, FileExists::Replace);
    }
    catch (\Exception $e) {
      $this->io()->error($this->t(
        'Could not create PO file: @destination due to error "%error"',
        ['%error' => $e->getMessage(), '@destination' => $destination],
        ['context' => 'translation handling']
      ));
      return;
    }

    $this->io()->success($this->t(
      'File created on: @destination',
      ['@destination' => $destination],
      [
        'context' => 'translation handling',
      ]));
  }

  /**
   * Ignore various contexts.
   *
   * @todo This is a quick way ignore some contexts we do not want to end up in the PO file.
   * It would be better to have a more flexible way to ignore
   * contexts. For now we know that all webform contexts should be ignored.
   */
  protected static function ignoreContexts(PoItem $item): bool {
    $ignoredContexts = [
      '^webform\..+',
    ];
    foreach ($ignoredContexts as $context) {
      if (preg_match(sprintf('/%s/', $context), $item->getContext())) {
        return TRUE;
      }
    }
    return FALSE;
  }

  /**
   * Create a .po file with only the user interface strings.
   *
   * @param string $langcode
   *   The langcode to import. Eg. 'en' or 'fr'.
   * @param string $source
   *   The path to the source .po file.
   * @param string $destination
   *   The path to the destination .po file.
   *
   * @command dpl_po:extract-ui
   * @usage drush dpl_po:extract-ui da da.po
   *   Extracts strings with config context and writes a fie with it.
   */
  public function createPoFileUiOnly(string $langcode, string $source, string $destination): void {
    $this->languageCode = $langcode;
    $this->validateSource($source);
    $this->validateDestination($destination);

    try {
      $file = $this->extractTranslationsIntoFile(self::CONFIG_PO_FILE_CONTEXT_PATTERN, $source, 'exclude');
      $destination = $this->fileSystem->move($file, $destination, FileExists::Replace);
    }
    catch (\Exception $e) {
      $this->io()->error($this->t(
        'Could not create PO file: @destination due to error "%error"',
        ['%error' => $e->getMessage(), '@destination' => $destination],
        [
          'context' => 'translation handling',
        ]));
      return;
    }

    $this->io()->success($this->t(
      'File created on: @destination',
      ['@destination' => $destination],
      [
        'context' => 'translation handling',
      ]));
  }

  /**
   * Import a configuration .po file.
   *
   * @param string $langcode
   *   The langcode to import. Eg. 'en' or 'fr'.
   * @param string $source
   *   The path to the source .po file.
   *
   * @command dpl_po:import-config-po
   * @usage drush dpl_po:import-config-po da da.config.po
   *   Imports the configuration po file into the system.
   */
  public function importConfigPoFile(string $langcode, string $source): void {
    $this->languageCode = $langcode;
    $this->validateSource($source);

    $this->importConfigPoFileBatch($source);

    $this->io()->success($this->t(
      'Config translations were imported from: @source',
      ['@source' => $source],
      [
        'context' => 'translation handling',
      ]));
  }

  /**
   * Import a configuration .po file in a batch.
   */
  protected function importConfigPoFileBatch(string $source): void {
    $this->moduleHandler->loadInclude('locale', 'bulk.inc');
    $this->moduleHandler->loadInclude('config_translation_po', 'bulk.inc');

    $this->validateSource($source);

    // @todo Get the full enderstanding of all the options here.
    // Until now it has been tested that behaviour is as expected
    // but it would be nice to know all implications of the settings.
    $options = [
      'customized' => 0,
      'overwrite_options' => [
        'not_customized' => 1,
        'customized' => 1,
      ],
      'finish_feedback' => TRUE,
      'use_remote' => TRUE,
      'langcode' => $this->languageCode,
    ];

    $file = $this->createFile($source);
    /** @var object{"uri": string} $file */
    $file = locale_translate_file_attach_properties($file, $options);
    $batch = locale_translate_batch_build([$file->uri => $file], $options);

    batch_set($batch);

    // Create or update all configuration translations for this language.
    if ($batch = config_translation_po_config_batch_update_components($options, [$this->languageCode])) {
      batch_set($batch);
    }

    drush_backend_batch_process();

  }

  /**
   * Import a configuration .po hosted remotely.
   *
   * @param string $langcode
   *   The langcode to import. Eg. 'en' or 'fr'.
   * @param string $url
   *   The url to the source .po file.
   *
   * @command dpl_po:import-remote-config-po
   * @usage drush dpl_po:import-remote-config-po da https://some-url.com/da.config.po
   *   Imports the remote configuration po file into the system.
   */
  public function importRemoteConfigPoFile(string $langcode, string $url): void {
    $this->languageCode = $langcode;

    // This is a bit odd but with the tools available
    // it seems the best way we can import the remote file
    // is to download it as a temporary file and then import it.
    if (!$import_po_file = $this->fileSystem->realpath('public://config.po')) {
      $this->io()->error($this->t('Could not create temporary file.'));
      return;
    }
    $this->validateDestination($import_po_file);

    $tmp_file = $this->fileSystem->tempnam('temporary://', 'po_config_');
    if (!is_string($tmp_file)) {
      $this->io()->error($this->t('Could not create temporary file.'));
      return;
    }

    $uri = $this->downloadTranslation($url, $tmp_file);
    $filepath = $uri ? $this->fileSystem->realpath($uri) : NULL;
    if (!is_string($filepath)) {
      $this->io()->error($this->t(
        'Config translations could not be imported from: @url',
        ['@url' => $url],
        ['context' => 'translation handling']
      ));
      return;
    }

    if ($destination = $this->fileSystem->move($filepath, $import_po_file, FileExists::Replace)) {
      $this->importConfigPoFileBatch($destination);
      $this->io()->success($this->t(
        'Config translations were imported from: @url',
        ['@url' => $url],
        ['context' => 'translation handling']
      ));

      $this->fileSystem->delete($destination);
    }
  }

  /**
   * Download a translation file from a source URL and save it to a destination.
   *
   * @param string $source
   *   The URL of the translation file to download.
   * @param string $destination
   *   The path where the downloaded translation file should be saved.
   *
   * @return string|null
   *   The path of the downloaded translation file,
   *   or null if the download failed.
   */
  protected function downloadTranslation(string $source, string $destination): ?string {
    $result_path = NULL;

    try {
      $response = $this->httpClient->request('GET', $source);
      $result_path = $this->fileSystem->saveData($response->getBody(), $destination, FileExists::Replace);
    }
    catch (TransferException $e) {
      $this->io()->error($this->t(
        'Failed to fetch file due to error "%error"',
        ['%error' => $e->getMessage()],
        [
          'context' => 'translation handling',
        ]));
    }
    catch (FileException | InvalidStreamWrapperException $e) {
      $this->io()->error($this->t(
        'Failed to save file due to error "%error"',
        ['%error' => $e->getMessage()],
        ['context' => 'translation handling']
      ));
    }

    return $result_path;
  }

  /**
   * Export configuration to a .po file.
   *
   * @param string $langcode
   *   The langcode to export. Eg. 'en' or 'fr'.
   * @param string $destination
   *   The path to the destination .po file.
   *
   * @command dpl_po:export-config-po
   * @usage drush dpl_po:export-config-po da da.config.po
   *   Exports the configuration po file into the system.
   */
  public function exportConfigPoFile(string $langcode, string $destination): void {
    $this->validateDestination($destination);
    $this->languageCode = $langcode;
    $this->destination = $destination;

    $names = $this->cteiConfigManager->getComponentNames([]);
    $items = $this->cteiConfigManager
      ->exportConfigTranslations($names, [$langcode]);

    if (!empty($items)) {
      if (!$tmp_filename = $this->fileSystem->tempnam('temporary://', 'po_')) {
        $this->io()->error($this->t('Could not create temp PO file.'));
        return;
      }

      $header = new PoHeader($langcode);
      $header->setProjectName($this->configFactory->get('system.site')->get('name'));
      $header->setLanguageName($langcode);

      $writer = new PoStreamWriter();
      $writer->setURI($tmp_filename);
      $writer->setHeader($header);

      $writer->open();
      foreach ($items as $item) {
        if (self::ignoreContexts($item)) {
          $this->io()->info('Skipping item with context: ' . $item->getContext());
          continue;
        }

        $writer->writeItem($item);
      }
      $writer->close();

      if (!is_string($tmp_filename) || !$this->fileSystem->realpath($tmp_filename)) {
        $this->io()->error($this->t(
          'Could not locate temp PO file.',
          [],
          [
            'context' => 'translation handling',
          ]));
        return;
      }
      if ($destination = $this->fileSystem->move($tmp_filename, $destination, FileExists::Replace)) {
        $this->io()->success($this->t(
          'File created on: @destination',
          ['@destination' => $destination],
          ['context' => 'translation handling']
        ));
      }
    }

  }

  /**
   * Validate if source file exists and is readable.
   *
   * @throws \Exception
   */
  protected function validateSource(string $source): void {
    if (!$source || !is_file($source)) {
      throw new \Exception('Invalid source file: ' . $source);
    }

    if (!is_readable($source)) {
      throw new \Exception('Unreadable source file: ' . $source);
    }
  }

  /**
   * Validate if destination directory exists and is writable.
   *
   * @throws \Exception
   */
  protected function validateDestination(string $destination): void {
    if (!$destination) {
      throw new \Exception('Destination was not defined.');
    }

    // Check for writable destination.
    $destination_dir = $this->fileSystem->dirname($destination);
    if (!is_writable($destination_dir)) {
      throw new \Exception('Destination dir is not writable: ' . $destination_dir);
    }
  }

  /**
   * Create a file object.
   *
   * The object created by this function
   * is needed by the locale_translate_* functions.
   *
   * @see DplPoCommands::importConfigPoFileBatch()
   */
  protected function createFile(string $path): \stdClass {
    $file = new \stdClass();
    $file->filename = $this->fileSystem->basename($path);
    $file->uri = $path;
    $file->langcode = $this->languageCode;

    return $file;
  }

  /**
   * Extract translations into a file.
   */
  protected function extractTranslationsIntoFile(string $pattern, string $source, string $mode = 'include'): \SplFileInfo {
    $reader = new PoStreamReader();
    $reader->setLangcode($this->languageCode);
    $reader->setURI($source);

    try {
      $reader->open();
    }
    catch (\Exception $exception) {
      throw $exception;
    }

    $header = $reader->getHeader();

    $uri = $this->fileSystem->tempnam('temporary://', 'po_');
    $writer = new PoStreamWriter();
    $writer->setURI($uri);
    $writer->setHeader($header);
    $writer->open();

    while ($item = $reader->readItem()) {
      if (self::ignoreContexts($item)) {
        $this->io()->info('Skipping item with context: ' . $item->getContext());
        continue;
      }

      if ($mode === 'include' && preg_match($pattern, $item->getContext())) {
        $writer->writeItem($item);
      }

      if ($mode === 'exclude' && !preg_match($pattern, $item->getContext())) {
        $writer->writeItem($item);
      }
    }

    $writer->close();

    return new \SplFileInfo($this->fileSystem->realpath($uri));
  }

}
