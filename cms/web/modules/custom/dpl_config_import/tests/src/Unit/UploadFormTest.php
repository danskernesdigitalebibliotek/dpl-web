<?php

namespace Drupal\Tests\dpl_config_import\Unit;

use Drupal\Core\Config\Config;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Extension\MissingDependencyException;
use Drupal\Core\Extension\ModuleInstallerInterface;
use Drupal\Core\Extension\ModuleUninstallValidatorException;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\dpl_config_import\Form\UploadForm;
use Drupal\file\FileInterface;
use Drupal\Tests\UnitTestCase;
use phpmock\Mock;
use phpmock\MockBuilder;
use Prophecy\Argument;
use Symfony\Component\Yaml\Exception\ParseException;
use Symfony\Component\Yaml\Parser;

/**
 * Unit test for upload form.
 */
class UploadFormTest extends UnitTestCase {

  /**
   * The YAML parser which provides data read from a file.
   *
   * @var \Symfony\Component\Yaml\Parser|\Prophecy\Prophecy\ObjectProphecy
   */
  private $yamlParser;

  /**
   * The configuration factory which manages Drupals configuration.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface|\Prophecy\Prophecy\ObjectProphecy
   */
  private $configFactory;

  /**
   * The module installer used to install and uninstall modules.
   *
   * @var \Drupal\Core\Extension\ModuleInstallerInterface|\Prophecy\Prophecy\ObjectProphecy
   */
  private $moduleInstaller;

  /**
   * The messenger used for communicating status to the user.
   *
   * @var \Drupal\Core\Messenger\MessengerInterface|\Prophecy\Prophecy\ObjectProphecy
   */
  private $messenger;

  /**
   * String translations used to manage labels and other feedback.
   *
   * @var \Drupal\Core\StringTranslation\TranslationInterface|\Prophecy\Prophecy\ObjectProphecy
   */
  private $translation;

  /**
   * The form state which the form is submitted with.
   *
   * @var \Drupal\Core\Form\FormStateInterface|\Prophecy\Prophecy\ObjectProphecy
   */
  private $formState;

  /**
   * The form array representing the form.
   *
   * @var mixed[]
   */
  private array $formArray;

  /**
   * The path to the uploaded YAML file.
   *
   * @var string
   */
  private string $yamlFilePath = '/path/file';

  /**
   * {@inheritDoc}
   */
  protected function setUp(): void {
    // Setup mocks with default values.
    $file = $this->prophesize(FileInterface::class);
    $file->getFileUri()->willReturn($this->yamlFilePath);

    $builder = new MockBuilder();
    $builder->setNamespace('Drupal\dpl_config_import\Form')
      ->setName("file_save_upload")
      ->setFunction(fn() => $file->reveal())
      ->build()
      ->enable();

    $this->configFactory = $this->prophesize(ConfigFactoryInterface::class);
    $this->yamlParser = $this->prophesize(Parser::class);
    $this->messenger = $this->prophesize(MessengerInterface::class);
    $this->moduleInstaller = $this->prophesize(ModuleInstallerInterface::class);
    $this->translation = $this->prophesize(TranslationInterface::class);

    $this->formArray = [];
    $this->formState = $this->prophesize(FormStateInterface::class);

    parent::setUp();
  }

  /**
   * Build a form to test based on the default values.
   */
  protected function buildForm(): UploadForm {
    $form = new UploadForm(
      $this->yamlParser->reveal(),
      $this->configFactory->reveal(),
      $this->moduleInstaller->reveal(),
      $this->messenger->reveal(),
    );
    $form->setStringTranslation($this->translation->reveal());
    return $form;
  }

  /**
   * Check that a form array can be built.
   */
  public function testFormBuilds(): void {
    $form = $this->buildForm();
    $form->buildForm([], $this->formState->reveal());
    $this->assertTrue(TRUE, 'The form can be built');
  }

  /**
   * Check that an error message is shown if invalid YAML is uploaded.
   */
  public function testInvalidYaml(): void {
    $this->yamlParser->parseFile($this->yamlFilePath)->willThrow(new ParseException('Invalid Yaml'));

    $form = $this->buildForm();
    $form->submitForm($this->formArray, $this->formState->reveal());

    $this->messenger->addError(Argument::any())->shouldHaveBeenCalled();
  }

  /**
   * Check that configuration can be imported.
   */
  public function testConfigurationImport(): void {
    $this->yamlParser->parseFile($this->yamlFilePath)->willReturn([
      'configuration' => [
        'settings.key' => [
          'a-value.key' => 'some-value',
        ],
      ],
    ]);

    $config = $this->prophesize(Config::class);
    $config->getRawData()->willReturn([]);

    $this->configFactory->getEditable('settings.key')->willReturn($config->reveal());

    $form = $this->buildForm();
    $form->submitForm($this->formArray, $this->formState->reveal());

    $config->setData([
      'a-value.key' => 'some-value',
    ])->shouldHaveBeenCalled();
    $config->save()->shouldHaveBeenCalled();
  }

  /**
   * Check that new configuration can be merged with existing configuration.
   */
  public function testConfigurationImportMerge(): void {
    $this->yamlParser->parseFile($this->yamlFilePath)->willReturn([
      'configuration' => [
        'settings.key' => [
          'another-value.key' => 'another-value',
          'array.key' => [1 => 'value-b'],
        ],
      ],
    ]);

    $config = $this->prophesize(Config::class);
    $config->getRawData()->willReturn([
      'some-value' => 'some-key',
      'array.key' => [0 => 'value-a'],
    ]);

    $this->configFactory->getEditable('settings.key')->willReturn($config->reveal());

    $form = $this->buildForm();
    $form->submitForm($this->formArray, $this->formState->reveal());

    $config->setData([
      'some-value' => 'some-key',
      'another-value.key' => 'another-value',
      'array.key' => ['value-a', 'value-b'],
    ])->shouldHaveBeenCalled();
    $config->save()->shouldHaveBeenCalled();
  }

  /**
   * Check that modules will be installed.
   */
  public function testModuleInstall(): void {
    $this->yamlParser->parseFile($this->yamlFilePath)->willReturn([
      'modules' => [
        'install' => [
          'module-a',
          'module-b',
        ],
      ],
    ]);

    $form = $this->buildForm();
    $form->submitForm($this->formArray, $this->formState->reveal());

    $this->moduleInstaller->install(['module-a', 'module-b'])->shouldHaveBeenCalled();
  }

  /**
   * Check that an error will be shown in modules cannot be installed.
   */
  public function testModuleInstallError(): void {
    $this->yamlParser->parseFile($this->yamlFilePath)->willReturn([
      'modules' => [
        'install' => [
          'module-a',
        ],
      ],
    ]);

    $this->moduleInstaller->install(['module-a'])->willThrow(new MissingDependencyException());

    $form = $this->buildForm();
    $form->submitForm($this->formArray, $this->formState->reveal());

    $this->messenger->addError(Argument::any())->shouldHaveBeenCalled();
    $this->moduleInstaller->uninstall([])->shouldHaveBeenCalled();
  }

  /**
   * Check that modules will be uninstalled.
   */
  public function testModuleUninstall(): void {
    $this->yamlParser->parseFile($this->yamlFilePath)->willReturn([
      'modules' => [
        'uninstall' => [
          'module-a',
          'module-b',
        ],
      ],
    ]);

    $form = $this->buildForm();
    $form->submitForm($this->formArray, $this->formState->reveal());

    $this->moduleInstaller->uninstall(['module-a', 'module-b'])->shouldHaveBeenCalled();
  }

  /**
   * Check that an error will be shown in modules cannot be uninstalled.
   */
  public function testModuleUninstallError(): void {
    $this->yamlParser->parseFile($this->yamlFilePath)->willReturn([
      'modules' => [
        'uninstall' => [
          'module-a',
        ],
      ],
    ]);

    $this->moduleInstaller->uninstall(['module-a'])->willThrow(new ModuleUninstallValidatorException());

    $form = $this->buildForm();
    $form->submitForm($this->formArray, $this->formState->reveal());

    $this->messenger->addError(Argument::any())->shouldHaveBeenCalled();
    $this->moduleInstaller->install([])->shouldHaveBeenCalled();
  }

  /**
   * {@inheritDoc}
   */
  public function tearDown(): void {
    Mock::disableAll();
  }

}
