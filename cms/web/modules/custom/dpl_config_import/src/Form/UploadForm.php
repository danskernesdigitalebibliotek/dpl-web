<?php

namespace Drupal\dpl_config_import\Form;

use Drupal\Component\Utility\NestedArray;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Extension\MissingDependencyException;
use Drupal\Core\Extension\ModuleInstallerInterface;
use Drupal\Core\Extension\ModuleUninstallValidatorException;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Yaml\Exception\ParseException;
use Symfony\Component\Yaml\Parser;

/**
 * Form for handling uploading of YAML files with configuration.
 */
class UploadForm extends FormBase {

  /**
   * Constructor.
   */
  public function __construct(
    private Parser $yamlParser,
    private ConfigFactoryInterface $config,
    private ModuleInstallerInterface $moduleInstaller,
    MessengerInterface $messenger
  ) {
    // We cannot use constructor property promotion as the property is already
    // defined by a trait.
    $this->messenger = $messenger;
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container): static {
    return new static(
      new Parser(),
      $container->get('config.factory'),
      $container->get('module_installer'),
      $container->get('messenger')
    );
  }

  /**
   * {@inheritDoc}
   */
  public function getFormId(): string {
    return 'dpl_config_import_upload';
  }

  /**
   * {@inheritDoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $form['file'] = [
      '#type' => 'file',
      '#title' => $this->t('Configuration file'),
      '#description' => $this->t(
        'Select a configuration file in YAML format to upload.',
        [],
        ['context' => 'DPL Config Import']
      ),
    ];
    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Upload'),
    ];

    return $form;
  }

  /**
   * {@inheritDoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    // If we do not specify validators for file_save_upload it will use a
    // default set of allowed file extensions which does not allow YAML files.
    $validators = [
      'file_validate_extensions' => ['yml yaml'],
    ];
    $file = file_save_upload('file', $validators, FALSE, 0);
    if (!$file || is_array($file)) {
      $this->messenger->addError($this->t(
        'Unable to handle the uploaded file',
        [],
        ['context' => 'DPL Config Import']
      ));
      return;
    }

    try {
      $yaml_data = $this->yamlParser->parseFile((string) $file->getFileUri());
    }
    catch (ParseException $e) {
      $this->messenger->addError($this->t(
        'Unable to parse YAML file: %reason',
        ['%reason' => $e->getMessage()],
        ['context' => 'DPL Config Import']
      ));
      return;
    }

    $configuration = $yaml_data['configuration'] ?? [];
    array_map(function ($value, int|string $key) {
      $config = $this->config->getEditable((string) $key);
      $new_config = NestedArray::mergeDeepArray([$config->getRawData(), $value], TRUE);
      $config->setData($new_config);
      $config->save();
    }, $configuration, array_keys($configuration));
    $this->messenger->addStatus('Configuration import complete');

    $modules = $yaml_data['modules'] ?? [];
    $install_modules = $modules['install'] ?? [];
    try {
      $this->moduleInstaller->install($install_modules);
      $this->messenger->addStatus($this->t(
        'Installed modules: %modules_list',
        ['%modules_list' => implode(', ', $install_modules)],
        ['context' => 'DPL Config Import']
      ));
    }
    catch (MissingDependencyException $e) {
      $this->messenger->addError($this->t(
        'Failed to install modules: @reason',
        ['@reason' => $e->getMessage()],
        ['context' => 'DPL Config Import']
      ));
    }

    $uninstall_modules = $modules['uninstall'] ?? [];
    try {
      $this->moduleInstaller->uninstall($uninstall_modules);
      $this->messenger->addStatus($this->t(
        'Uninstalled modules: %modules_list',
        ['%modules_list' => implode(', ', $uninstall_modules)],
        ['context' => 'DPL Config Import']
      ));
    }
    catch (ModuleUninstallValidatorException $e) {
      $this->messenger->addError($this->t(
        'Failed to uninstall modules: @reason',
        ['@reason' => $e->getMessage()],
        ['context' => 'DPL Config Import']
      ));
    }
  }

}
