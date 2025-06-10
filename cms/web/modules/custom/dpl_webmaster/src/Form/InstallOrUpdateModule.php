<?php

declare(strict_types=1);

namespace Drupal\dpl_webmaster\Form;

use Drupal\Core\Archiver\ArchiverInterface;
use Drupal\Core\Archiver\ArchiverManager;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\File\FileExists;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\FileTransfer\Local;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\State\StateInterface;
use Drupal\Core\Updater\Module;
use Drupal\Core\Updater\Updater;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

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
   * @param \Drupal\Core\Archiver\ArchiverManager $archiverManager
   *   The archive manager service.
   */
  public function __construct(
    protected string $root,
    protected ModuleHandlerInterface $moduleHandler,
    protected string $sitePath,
    protected ArchiverManager $archiverManager,
    protected FileSystemInterface $fileSystem,
    protected StateInterface $state,
    protected SessionInterface $session,
    protected ArchiverManager $archiveManager,
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
      $container->get('plugin.manager.archiver'),
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
    $all_files = $this->getRequest()->files->get('files', []);

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

    $directory = _update_manager_extract_directory();
    try {
      $archive = $this->extract($local_cache, $directory);
    }
    catch (\Exception $e) {
      $this->messenger()->addError($e->getMessage());
      return;
    }

    $project = $this->getProjectName($archive);

    if (!$project) {
      $this->messenger()->addError($this->t('Could not determine module name from archive'));
      return;
    }

    $archive_errors = $this->verifyProject($project, $local_cache, $directory);
    if (!empty($archive_errors)) {
      $this->messenger()->addError(array_shift($archive_errors));
      // @todo Fix me in D8: We need a way to set multiple errors on the same
      //   form element and have all of them appear!
      if (!empty($archive_errors)) {
        foreach ($archive_errors as $error) {
          $this->messenger()->addError($error);
        }
      }
      return;
    }

    // Make sure the Updater registry is loaded.
    drupal_get_updaters();

    $project_location = $directory . '/' . $project;
    try {
      $updater = Updater::factory($project_location, $this->root);
    }
    catch (\Exception $e) {
      $this->messenger()->addError($e->getMessage());
      return;
    }

    try {
      $project_title = Updater::getProjectTitle($project_location);
    }
    catch (\Exception $e) {
      $this->messenger()->addError($e->getMessage());
      return;
    }

    if (!$project_title) {
      $this->messenger()->addError($this->t('Unable to determine %project name.', ['%project' => $project]));
    }

    if (!$updater instanceof Module) {
      $this->messenger()->addError($this->t('%project is not a module.', ['%project' => $project]));
      return;
    }

    // This is where we diverge from UpdateManagerInstall and pass over control
    // to update.php. It'll pick up the files for the module as we've already
    // extracted it in the directory where it expects to find it.
    if ($updater->isInstalled()) {
      $this->updateProject([$project], $form_state);
      return;
    }

    $projectRealLocation = $this->fileSystem->realpath($project_location);

    if (!$projectRealLocation) {
      $this->messenger()->addError($this->t('Internal error, could not find files.'));
      return;
    }

    $this->overwriteProject(
      $projectRealLocation,
      $this->root . '/modules/local/' . $project,
    );

    $this->messenger()->addMessage($this->t('%project sucessfully uploaded. You can now enable it below.', ['%project' => $project]));

    $form_state->setRedirect('system.modules_list');
  }

  /**
   * Get project name from archive.
   *
   * The achive file name might not match the project name, so extract the
   * project name by getting the directory name inside the archive.
   */
  protected function getProjectName(ArchiverInterface $archiver): string {
    $files = $archiver->listContents();

    // Unfortunately, we can only use the directory name to determine the project
    // name. Some archivers list the first file as the directory (i.e., MODULE/)
    // and others list an actual file (i.e., MODULE/README.TXT).
    return strtok($files[0], '/\\');
  }

  /**
   * Extract archive.
   */
  protected function extract(string $file, string $directory): ArchiverInterface {
    /** @var \Drupal\Core\Archiver\ArchiverInterface $archiver */
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
      catch (\FileException $e) {
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
   * @return array<>
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
        'no-core' => t('Automatic updating of Drupal core is not supported. See the <a href=":update-guide">Updating Drupal guide</a> for information on how to update Drupal core manually.', [':update-guide' => 'https://www.drupal.org/docs/updating-drupal']),
      ];
    }

    // Parse all the .info.yml files and make sure at least one is compatible with
    // this version of Drupal core. If one is compatible, then the project as a
    // whole is considered compatible (since, for example, the project may ship
    // with some out-of-date modules that are not necessary for its overall
    // functionality).
    $compatible_project = FALSE;
    $incompatible = [];
    $files = $this->fileSystem->scanDirectory("$directory/$project", '/.*\.info.yml$/', ['key' => 'name', 'min_depth' => 0]);
    foreach ($files as $file) {
      // Get the .info.yml file for the module or theme this file belongs to.
      $info = \Drupal::service('info_parser')->parse($file->uri);

      // If the module or theme is incompatible with Drupal core, set an error.
      if ($info['core_incompatible']) {
        $incompatible[] = !empty($info['name']) ? $info['name'] : t('Unknown');
      }
      else {
        $compatible_project = TRUE;
        break;
      }
    }

    if (empty($files)) {
      $errors[] = t('%archive_file does not contain any .info.yml files.', ['%archive_file' => $file_system->basename($archive_file)]);
    }
    elseif (!$compatible_project) {
      $errors[] = \Drupal::translation()->formatPlural(
        count($incompatible),
        '%archive_file contains a version of %names that is not compatible with Drupal @version.',
        '%archive_file contains versions of modules or themes that are not compatible with Drupal @version: %names',
        [
          '@version' => \Drupal::VERSION,
          '%archive_file' => $file_system->basename($archive_file),
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

    $this->fileSystem->move($tmp, $dest);

    $this->fileSystem->deleteRecursive($source);
  }

  /**
   * Copy uploaded module into place run updates.
   *
   * @param string[] $projects
   *   List of projects to update.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   Form state to set redirect on.
   */
  protected function updateProject(array $projects, FormStateInterface $form_state): void {
    // Most of this has been lifted from UpdateReady::submitForm().
    drupal_get_updaters();

    $updates = [];
    $directory = _update_manager_extract_directory();

    $project_real_location = NULL;
    foreach ($projects as $project) {
      $project_location = $directory . '/' . $project;
      $updater = Updater::factory($project_location, $this->root);
      $project_real_location = $this->fileSystem->realpath($project_location);
      $updates[] = [
        'project' => $project,
        'updater_name' => get_class($updater),
        'local_url' => $project_real_location,
      ];
    }

    // Contrary to UpdateReady::submitForm(), we don't check file owners or
    // support FTP method.
    $this->moduleHandler->loadInclude('update', 'inc', 'update.authorize');
    $filetransfer = new Local($this->root, $this->fileSystem);
    $response = update_authorize_run_update($filetransfer, $updates);
    if ($response instanceof Response) {
      $form_state->setResponse($response);
    }
  }

}
