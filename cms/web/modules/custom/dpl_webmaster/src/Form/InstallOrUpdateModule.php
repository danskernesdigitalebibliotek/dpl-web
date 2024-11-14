<?php

declare(strict_types=1);

namespace Drupal\dpl_webmaster\Form;

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
   * Constructs a new UpdateManagerInstall.
   *
   * @param string $root
   *   The root location under which installed projects will be saved.
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
   */
  public function __construct(
    protected string $root,
    protected ModuleHandlerInterface $moduleHandler,
    protected string $sitePath,
    protected ArchiverManager $archiverManager,
    protected FileSystemInterface $fileSystem,
    protected StateInterface $state,
    protected SessionInterface $session,
  ) {}

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'update_manager_install_form';
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      (string) $container->get('update.root'),
      $container->get('module_handler'),
      $container->getParameter('site.path'),
      $container->get('plugin.manager.archiver'),
      $container->get('file_system'),
      $container->get('state'),
      $container->get('session'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $this->moduleHandler->loadInclude('update', 'inc', 'update.manager');
    if (!_update_manager_check_backends($form, 'install')) {
      return $form;
    }

    $form['help_text'] = [
      '#prefix' => '<p>',
      '#markup' => $this->t('You can find <a href=":module_url">modules</a> and <a href=":theme_url">themes</a> on <a href=":drupal_org_url">drupal.org</a>. The following file extensions are supported: %extensions.', [
        ':module_url' => 'https://www.drupal.org/project/modules',
        ':theme_url' => 'https://www.drupal.org/project/themes',
        ':drupal_org_url' => 'https://www.drupal.org',
        '%extensions' => $this->archiverManager->getExtensions(),
      ]),
      '#suffix' => '</p>',
    ];

    $form['project_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Add from a URL'),
      '#description' => $this->t('For example: %url', ['%url' => 'https://ftp.drupal.org/files/projects/name.tar.gz']),
    ];

    // Provide upload option only if file module exists.
    if ($this->moduleHandler->moduleExists('file')) {
      $form['information'] = [
        '#prefix' => '<strong>',
        '#markup' => $this->t('Or'),
        '#suffix' => '</strong>',
      ];

      $form['project_upload'] = [
        '#type' => 'file',
        '#title' => $this->t('Upload a module or theme archive'),
        '#description' => $this->t('For example: %filename from your local computer', ['%filename' => 'name.tar.gz']),
      ];
    }

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
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $all_files = $this->getRequest()->files->get('files', []);
    if ($this->moduleHandler->moduleExists('file')) {
      if (!($form_state->getValue('project_url') xor !empty($all_files['project_upload']))) {
        $form_state->setErrorByName('project_url', $this->t('You must either provide a URL or upload an archive file.'));
      }
    }
    else {
      if (!($form_state->getValue('project_url'))) {
        $form_state->setErrorByName('project_url', $this->t('You must provide a URL to install.'));
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $local_cache = '';
    $all_files = $this->getRequest()->files->get('files', []);
    if ($form_state->getValue('project_url')) {
      $local_cache = update_manager_file_get($form_state->getValue('project_url'));
      if (!$local_cache) {
        $this->messenger()->addError($this->t('Unable to retrieve Drupal project from %url.', ['%url' => $form_state->getValue('project_url')]));
        return;
      }
    }
    elseif (!empty($all_files['project_upload']) && $this->moduleHandler->moduleExists('file')) {
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
    }

    $directory = _update_manager_extract_directory();
    try {
      $archive = update_manager_archive_extract($local_cache, $directory);
    }
    catch (\Exception $e) {
      $this->messenger()->addError($e->getMessage());
      return;
    }

    $files = $archive->listContents();
    if (!$files) {
      $this->messenger()->addError($this->t('Provided archive contains no files.'));
      return;
    }

    // Unfortunately, we can only use the directory name to determine the
    // project name. Some archivers list the first file as the directory (i.e.,
    // MODULE/) and others list an actual file (i.e., MODULE/README.TXT).
    $project = strtok($files[0], '/\\');

    $archive_errors = $this->moduleHandler->invokeAll('verify_update_archive', [$project, $local_cache, $directory]);
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

    if ($updater->isInstalled()) {
      // Tell UpdateReady form which projects to update.
      $this->session->set('update_manager_update_projects', [$project => $project]);
      $form_state->setRedirect('update.confirmation_page');
      return;
    }

    $project_real_location = $this->fileSystem->realpath($project_location);
    $arguments = [
      'project' => $project,
      'updater_name' => get_class($updater),
      'local_url' => $project_real_location,
    ];

    // This process is inherently difficult to test therefore use a state flag.
    $test_authorize = FALSE;
    if (drupal_valid_test_ua()) {
      $test_authorize = $this->state->get('test_uploaders_via_prompt', FALSE);
    }
    // If the owner of the directory we extracted is the same as the owner of
    // our configuration directory (e.g. sites/default) where we're trying to
    // install the code, there's no need to prompt for FTP/SSH credentials.
    // Instead, we instantiate a Drupal\Core\FileTransfer\Local and invoke
    // update_authorize_run_install() directly.
    if (!$test_authorize) {
      $this->moduleHandler->loadInclude('update', 'inc', 'update.authorize');
      $filetransfer = new Local($this->root, $this->fileSystem);
      $response = call_user_func_array('update_authorize_run_install', array_merge([$filetransfer], $arguments));
      if ($response instanceof Response) {
        $form_state->setResponse($response);
      }
    }

    // Otherwise, go through the regular workflow to prompt for FTP/SSH
    // credentials and invoke update_authorize_run_install() indirectly with
    // whatever FileTransfer object authorize.php creates for us.
    else {
      // The page title must be passed here to ensure it is initially used when
      // authorize.php loads for the first time with the FTP/SSH credentials
      // form.
      system_authorized_init('update_authorize_run_install', __DIR__ . '/../../update.authorize.inc', $arguments, $this->t('Update manager'));
      $form_state->setRedirectUrl(system_authorized_get_url());
    }
  }

}
