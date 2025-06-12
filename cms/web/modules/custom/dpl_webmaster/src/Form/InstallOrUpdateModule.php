<?php

declare(strict_types=1);

namespace Drupal\dpl_webmaster\Form;

use Drupal\Core\Archiver\ArchiverInterface;
use Drupal\Core\Archiver\ArchiverManager;
use Drupal\Core\Extension\InfoParserInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\File\Exception\FileException;
use Drupal\Core\File\FileExists;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Site\Settings;
use Drupal\Core\State\StateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use function Safe\mkdir;

/**
 * Upload or update an uploaded module.
 *
 * This is basically a copy of Drupal\update\Form\UpdateManagerInstall (modulo
 * (a lot of) code style fixes) that'll allow for overwriting existing module.
 *
 * Ideally we'd just extend UpdateManagerInstall, but as most of it's code is in
 * the method we need to override, we don't, to reduce coupling.
 */
class InstallOrUpdateModule extends FormBase {

  /**
   * Constructs a new InstallOrUpdateModule.
   *
   * @param string $root
   *   The Drupal root under which installed projects will be saved.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $moduleHandler
   *   The module handler.
   * @param string $sitePath
   *   The site path.
   * @param \Drupal\Core\Archiver\ArchiverManager $archiverManager
   *   The archiver plugin manager service.
   * @param \Drupal\Core\File\FileSystemInterface $fileSystem
   *   The file system service.
   * @param \Drupal\Core\State\StateInterface $state
   *   The state service.
   * @param \Symfony\Component\HttpFoundation\Session\SessionInterface $session
   *   The current session.
   * @param \Drupal\Core\Extension\InfoParserInterface $infoParser
   *   The info parser service.
   */
  public function __construct(
    protected string $root,
    protected ModuleHandlerInterface $moduleHandler,
    protected string $sitePath,
    protected ArchiverManager $archiverManager,
    protected FileSystemInterface $fileSystem,
    protected StateInterface $state,
    protected SessionInterface $session,
    protected InfoParserInterface $infoParser,
  ) {}

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'dpl_webmaster_upload_form';
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      (string) $container->get('kernel')->getAppRoot(),
      $container->get('module_handler'),
      $container->getParameter('site.path'),
      $container->get('plugin.manager.archiver'),
      $container->get('file_system'),
      $container->get('state'),
      $container->get('session'),
      $container->get('info_parser'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    // This is an unchanged copy of UpdateManagerInstall::buildForm().
    $this->moduleHandler->loadInclude('update', 'inc', 'update.manager');

    $form['help_text'] = [
      '#prefix' => '<p>',
      '#markup' => $this->t('The following file extensions are supported: %extensions.', [
        '%extensions' => $this->archiverManager->getExtensions(),
      ]),
      '#suffix' => '</p>',
    ];

    $form['project_upload'] = [
      '#type' => 'file',
      '#title' => $this->t('Upload a module archive'),
      '#description' => $this->t('For example: %filename from your local computer', ['%filename' => 'name.tar.gz']),
      '#required' => TRUE,
    ];

    $form['actions'] = ['#type' => 'actions'];
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#button_type' => 'primary',
      '#value' => $this->t('Continue'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    // This is mostly a copy of UpdateManagerInstall::submitForm(), apart from
    // the handling of already installed modules and file permissions check
    // (search for 'UpdateManagerInstall').
    $local_cache = '';

    $validators = ['FileExtension' => ['extensions' => $this->archiverManager->getExtensions()]];
    /** @var \Drupal\file\FileInterface|null $finfo */
    $finfo = file_save_upload('project_upload', $validators, FALSE, 0, FileExists::Replace);
    if (!$finfo) {
      // Failed to upload the file. file_save_upload() calls
      // \Drupal\Core\Messenger\MessengerInterface::addError() on failure.
      return;
    }
    /** @var string $local_cache */
    $local_cache = $finfo->getFileUri();

    $directory = $this->getTemporaryDirectory();
    try {
      $archive = $this->extract($local_cache, $directory);
    }
    catch (\Exception $e) {
      $this->messenger()->addError($e->getMessage());
      return;
    }

    try {
      $project = $this->getProjectName($archive);
    }
    catch (\Throwable) {
      $this->messenger()->addError($this->t('Could not determine module name from archive'));
      return;
    }

    $archive_errors = $this->verifyProject($project, $local_cache, $directory);
    if (!empty($archive_errors)) {
      $this->messenger()->addError(array_shift($archive_errors));
      if (!empty($archive_errors)) {
        foreach ($archive_errors as $error) {
          $this->messenger()->addError($error);
        }
      }
      return;
    }

    $projectDestination = $this->root . '/modules/local/' . $project;

    $projectLocation = $directory . '/' . $project;

    $projectRealLocation = $this->fileSystem->realpath($projectLocation);

    if (!$projectRealLocation) {
      $this->messenger()->addError($this->t('Internal error, could not find files.'));
      return;
    }

    $this->overwriteProject($projectRealLocation, $projectDestination);

    // If it's an enabled module, send user to `update.php`.
    if ($this->moduleHandler->moduleExists($project)) {
      // Skip the first info page of `update.php`.
      $form_state->setRedirect('system.db_update', ['op' => 'selection']);
      // Flush the Opcode cache. If we don't there could be a small delay
      // between updating the files and PHP noticing, which can make
      // `update.php` think there's no updates (as the new update hooks isn't
      // available yet). Only invalidating the relevant files would be nicer,
      // but more work, and uploading a module is a fairly uncommon event.
      opcache_reset();

      return;
    }

    $this->messenger()->addMessage($this->t('%project sucessfully uploaded. You can now enable it below.', ['%project' => $project]));

    $form_state->setRedirect('system.modules_list');
  }

  /**
   * Get temporary working directory.
   *
   * Ensures it exists.
   */
  protected function getTemporaryDirectory(): string {
    // Basically a copy of what _update_manager_extract_directory() did.
    $directory = 'temporary://dpl-webmaster-' . substr(hash('sha256', Settings::getHashSalt()), 0, 8);
    if (!file_exists($directory)) {
      mkdir($directory);
    }

    return $directory;
  }

  /**
   * Get project name from archive.
   *
   * The achive file name might not match the project name, so extract the
   * project name by getting the directory name inside the archive.
   */
  protected function getProjectName(ArchiverInterface $archiver): string {
    $files = $archiver->listContents();

    // Unfortunately, we can only use the directory name to determine the
    // project name. Some archivers list the first file as the directory (i.e.,
    // MODULE/) and others list an actual file (i.e., MODULE/README.TXT).
    $project = strtok($files[0], '/\\');

    if (!$project) {
      throw new \RuntimeException('Could not determine project name from archive.');
    }

    return $project;
  }

  /**
   * Extract archive.
   */
  protected function extract(string $file, string $directory): ArchiverInterface {
    /** @var \Drupal\Core\Archiver\ArchiverInterface|null $archiver */
    $archiver = $this->archiverManager->getInstance([
      'filepath' => $file,
    ]);
    if (!$archiver) {
      throw new \Exception("Cannot extract '$file', not a valid archive");
    }

    $project = $this->getProjectName($archiver);

    // Delete the destination if it exists.
    $extract_location = $directory . '/' . $project;
    if (file_exists($extract_location)) {
      try {
        $this->fileSystem->deleteRecursive($extract_location);
      }
      catch (FileException $e) {
        // Ignore failed deletes.
      }
    }

    $archiver->extract($directory);
    return $archiver;
  }

  /**
   * Sanity check an unpacked archive.
   *
   * This does the same as the old update_verify_update_archive().
   *
   * @return array<string|int, mixed>
   *   List of error messages.
   */
  protected function verifyProject(string $project, string $archive_file, string $directory): array {
    $errors = [];

    // Make sure this isn't a tarball of Drupal core.
    if (
      file_exists("$directory/$project/index.php")
        && file_exists("$directory/$project/core/install.php")
        && file_exists("$directory/$project/core/includes/bootstrap.inc")
        && file_exists("$directory/$project/core/modules/node/node.module")
        && file_exists("$directory/$project/core/modules/system/system.module")
    ) {
      return [
        'no-core' => $this->t('Automatic updating of Drupal core is not supported. See the <a href=":update-guide">Updating Drupal guide</a> for information on how to update Drupal core manually.', [':update-guide' => 'https://www.drupal.org/docs/updating-drupal']),
      ];
    }

    // Parse all the .info.yml files and make sure at least one is compatible
    // with this version of Drupal core. If one is compatible, then the project
    // as a whole is considered compatible (since, for example, the project may
    // ship with some out-of-date modules that are not necessary for its overall
    // functionality).
    $compatible_project = FALSE;
    $incompatible = [];
    $files = $this->fileSystem->scanDirectory(
      "$directory/$project",
      '/.*\.info.yml$/',
      ['key' => 'name', 'min_depth' => 0],
    );
    foreach ($files as $file) {
      // Get the .info.yml file for the module or theme this file belongs to.
      $info = $this->infoParser->parse($file->uri);

      // If the module or theme is incompatible with Drupal core, set an error.
      if ($info['core_incompatible']) {
        $incompatible[] = !empty($info['name']) ? $info['name'] : $this->t('Unknown');
      }
      else {
        $compatible_project = TRUE;
        break;
      }
    }

    if (empty($files)) {
      $errors[] = $this->t('%archive_file does not contain any .info.yml files.', ['%archive_file' => $this->fileSystem->basename($archive_file)]);
    }
    elseif (!$compatible_project) {
      $errors[] = $this->formatPlural(
        count($incompatible),
        '%archive_file contains a version of %names that is not compatible with Drupal @version.',
        '%archive_file contains versions of modules or themes that are not compatible with Drupal @version: %names',
        [
          '@version' => \Drupal::VERSION,
          '%archive_file' => $this->fileSystem->basename($archive_file),
          '%names' => implode(', ', $incompatible),
        ]
      );
    }

    return $errors;
  }

  /**
   * Move project into place.
   *
   * As the source (most likely in /tmp) and destination is probably on separate
   * mounts, copy the project to a temporary directory next to the destination,
   * and use then use an atomic move.
   */
  protected function overwriteProject(string $source, string $dest): void {
    $tmp = $dest . '-temp';

    $files = $this->fileSystem->scanDirectory(dirname($source), '/.*/');

    $this->fileSystem->prepareDirectory($tmp, FileSystemInterface::CREATE_DIRECTORY);

    foreach ($files as $file) {
      $tmpFile = $tmp . substr($file->uri, strlen($source));

      // Ensure the file directory exists before trying to copy it.
      $dirName = dirname($tmpFile);
      $this->fileSystem->prepareDirectory($dirName, FileSystemInterface::CREATE_DIRECTORY);

      $this->fileSystem->copy(
        $file->uri,
        $tmpFile,
      );
    }

    // Remove the destination if it exists, else move will just move inside the
    // destination directory.
    if (file_exists($dest)) {
      $this->fileSystem->deleteRecursive($dest);
    }

    $this->fileSystem->move($tmp, $dest);

    $this->fileSystem->deleteRecursive($source);
  }

}
