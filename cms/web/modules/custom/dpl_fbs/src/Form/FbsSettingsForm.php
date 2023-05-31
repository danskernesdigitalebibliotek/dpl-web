<?php

namespace Drupal\dpl_fbs\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\dpl_react\DplReactConfigInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * FBS setting form.
 */
class FbsSettingsForm extends ConfigFormBase {

  /**
   * Default constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   Config factory.
   * @param \Drupal\dpl_react\DplReactConfigInterface $configService
   *   FBS configuration object.
   */
  public function __construct(
    ConfigFactoryInterface $config_factory,
    protected DplReactConfigInterface $configService,
  ) {
    parent::__construct($config_factory);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      $container->get('config.factory'),
      \Drupal::service('dpl_fbs.settings')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return [
      $this->configService->getConfigKey(),
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'dpl_fbs_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->configService->loadConfig();

    $form['settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Basic settings', [], ['context' => 'Dpl Fbs']),
      '#tree' => FALSE,
    ];

    $form['settings']['base_url'] = [
      '#type' => 'url',
      '#title' => $this->t('FBS service url', [], ['context' => 'Dpl Fbs']),
      '#default_value' => $config->get('base_url'),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    parent::submitForm($form, $form_state);

    $this->config($this->configService->getConfigKey())
      ->set('base_url', $form_state->getValue('base_url'))
      ->save();
  }

}
