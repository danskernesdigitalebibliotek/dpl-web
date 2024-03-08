<?php

namespace Drupal\dpl_po\Commands;

use Drupal\Component\Gettext\PoHeader;
use Drupal\Component\Gettext\PoStreamReader;
use Drupal\Component\Gettext\PoStreamWriter;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\dpl_po\Services\CtpConfigManager;
use Drush\Commands\DrushCommands;

use function Safe\filemtime;
use function Safe\preg_match;
use function Safe\rename;

/**
 * A Drush commandfile.
 */
class DplPoCommands extends DrushCommands {
  use StringTranslationTrait;

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
   * Set the destination.
   */
  protected function setDestination(string $path): void {
    $this->destination = $path;
  }

  /**
   * Get the destination.
   */
  protected function getDestination(): ?string {
    return $this->destination;
  }

  /**
   * Set the source.
   */
  protected function setSource(string $path): void {
    $this->source = $path;
  }

  /**
   * Get the source.
   */
  protected function getSource(): ?string {
    return $this->source;
  }

  /**
   * Set the language code.
   */
  protected function setLanguageCode(string $langcode): void {
    $this->languageCode = $langcode;
  }

  /**
   * Get the language code.
   */
  protected function getLanguageCode(): ?string {
    return $this->languageCode;
  }

  /**
   * Class constructor.
   */
  public function __construct(
    protected ConfigFactoryInterface $configFactory,
    protected CtpConfigManager $cteiConfigManager,
    protected FileSystemInterface $fileSystem,
    protected ModuleHandlerInterface $moduleHandler
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
    $this->setLanguageCode($langcode);
    $this->setSource($source);
    $this->setDestination($destination);
    $this->validateSource();
    $this->validateDestination();

    try {
      $file = $this->extractTranslationsIntoFile('/^([a-z]+\.)+/');
      $destination = $this->moveFile($file);
    }
    catch (\Exception $exception) {
      $this->io()->error($this->t('Could not create PO file: @destination (createPoFileConfigOnly)', ['@destination' => $destination]));
      return;
    }

    $this->io()->success($this->t('File created on: @destination', ['@destination' => $destination]));
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
  public function createPoFileUiOnly($langcode, $source, $destination): void {
    $this->setLanguageCode($langcode);
    $this->setSource($source);
    $this->setDestination($destination);
    $this->validateSource();
    $this->validateDestination();

    try {
      $file = $this->extractTranslationsIntoFile('/^([a-z]+\.)+/', 'exclude');
      $destination = $this->moveFile($file);
    }
    catch (\Exception $exception) {
      $this->io()->error($this->t('Could not create PO file: @destination (createPoFileUiOnly)', ['@destination' => $destination]));
      return;
    }

    $this->io()->success($this->t('File created on: @destination', ['@destination' => $destination]));
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
    $this->setLanguageCode($langcode);
    $this->setSource($source);
    $this->validateSource();

    $this->importConfigPoFileBatch();

    $this->io()->success($this->t('Config translations were imported from: @source', ['@source' => $source]));
  }

  /**
   * Import a configuration .po file in a batch.
   */
  protected function importConfigPoFileBatch(): void {
    $this->moduleHandler->loadInclude('locale', 'bulk.inc');
    $this->moduleHandler->loadInclude('config_translation_po', 'bulk.inc');

    $langcode = $this->getLanguageCode();
    $this->validateSource();

    $options =
    [
      'customized' => 0,
      'overwrite_options' =>
    [
      'not_customized' => 1,
      'customized' => 1,
    ],
      'finish_feedback' => TRUE,
      'use_remote' => TRUE,
      'langcode' => $langcode,
    ];

    // We have already validated the source file
    // by calling self:.validateSource().
    // phpcs:ignore
    // @phpstan-ignore-next-line
    $file = $this->createFile($this->getSource());
    /** @var object{"uri": string} $file */
    $file = locale_translate_file_attach_properties($file, $options);
    $batch = locale_translate_batch_build([$file->uri => $file], $options);

    batch_set($batch);

    // Create or update all configuration translations for this language.
    if ($batch = config_translation_po_config_batch_update_components($options, [$langcode])) {
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
    $this->setLanguageCode($langcode);
    if (!$temp_po_file = $this->fileSystem->realpath('public://config.po')) {
      $this->io()->error($this->t('Could not create temporary file.'));
      return;
    }
    $this->setDestination($temp_po_file);
    $this->validateDestination();

    $tmp_file = $this->fileSystem->tempnam('temporary://', 'po_config_');
    if (!is_string($tmp_file)) {
      $this->io()->error($this->t('Could not create temporary file.'));
      return;
    }

    $uri = system_retrieve_file($url, $tmp_file, FALSE, FileSystemInterface::EXISTS_REPLACE);
    $filepath = $this->fileSystem->realpath($uri);
    if (!is_string($filepath)) {
      $this->io()->error($this->t('Config translations could not be imported from: @url', ['@url' => $url]));
      return;
    }

    try {
      $file = new \SplFileInfo($filepath);
      $destination = $this->moveFile($file);
    }
    catch (\Exception $exception) {
      $this->io()->error($this->t('Could not create PO file: @file (importRemoteConfigPoFile)', ['@file' => $filepath]));
      return;
    }

    if ($destination) {
      $this->setSource($destination);
      $this->importConfigPoFileBatch();
      $this->io()->success($this->t('Config translations were imported from: @url', ['@url' => $url]));

      $this->fileSystem->delete($destination);
    }
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
    $this->setLanguageCode($langcode);
    $this->setDestination($destination);
    $this->validateDestination();

    $names = $this->cteiConfigManager->getComponentNames([]);
    $items = $this->cteiConfigManager
      ->exportConfigTranslations($names, [$langcode]);

    if (!empty($items)) {
      if (!$uri = $this->fileSystem->tempnam('temporary://', 'po_')) {
        $this->io()->error($this->t('Could not create temp PO file.'));
        return;
      }

      $header = new PoHeader($langcode);
      $header->setProjectName($this->configFactory->get('system.site')->get('name'));
      $header->setLanguageName($langcode);

      $writer = new PoStreamWriter();
      $writer->setURI($uri);
      $writer->setHeader($header);

      $writer->open();
      foreach ($items as $item) {
        $writer->writeItem($item);
      }
      $writer->close();

      if (!is_string($uri) || !$file = $this->fileSystem->realpath($uri)) {
        $this->io()->error($this->t('Could not locate temp PO file.'));
        return;
      }

      try {
        $destination = $this->moveFile(new \SplFileInfo($file));
      }
      catch (\Exception $exception) {
        $this->io()->error($this->t('Could not create PO file: @file (exportConfigPoFile)', ['@file' => $uri]));
        return;
      }

      $this->io()->success($this->t('File created on: @destination', ['@destination' => $destination]));
    }
  }

  /**
   * Validate if source file exists and is readable.
   *
   * @throws \Exception
   */
  protected function validateSource(): void {
    $source = $this->getSource();

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
  protected function validateDestination(): void {
    if (!$destination = $this->getDestination()) {
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
   */
  protected function createFile(string $path): \stdClass {
    $file = new \stdClass();
    $file->filename = $this->fileSystem->basename($path);
    $file->uri = $path;
    $file->langcode = $this->getLanguageCode();
    $file->timestamp = filemtime($path);

    return $file;
  }

  /**
   * Move a file to the destination.
   */
  protected function moveFile(\SplFileInfo $file): ?string {
    if ($destination = $this->getDestination()) {
      rename($file->getRealPath(), $destination);
    }

    return $destination;
  }

  /**
   * Extract translations into a file.
   */
  protected function extractTranslationsIntoFile(string $pattern, string $mode = 'include'): \SplFileInfo {
    $source = $this->getSource();
    if (!$source = $this->getSource()) {
      throw new \Exception('Source is not defined.');
    }

    $file = $this->createFile($source);
    $reader = new PoStreamReader();
    $reader->setLangcode($file->langcode);
    $reader->setURI($file->uri);

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
