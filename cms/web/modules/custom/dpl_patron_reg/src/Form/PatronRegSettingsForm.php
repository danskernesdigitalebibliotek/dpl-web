<?php

namespace Drupal\dpl_patron_reg\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\dpl_react\DplReactConfigInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * PatronRegSettingsForm setting form.
 */
class PatronRegSettingsForm extends ConfigFormBase {

  /**
   * Constructs a \Drupal\system\ConfigFormBase object.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   * @param \Drupal\dpl_react\DplReactConfigInterface $configService
   *   The patron registration config service.
   */
  public function __construct(
    ConfigFactoryInterface $config_factory,
    protected DplReactConfigInterface $configService
  ) {
    $this->setConfigFactory($config_factory);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      $container->get('config.factory'),
      \Drupal::service('dpl_patron_reg.settings')
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
    return 'dpl_patron_reg_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->configService->getConfig();

    $form['age_limit'] = [
      '#type' => 'number',
      '#title' => $this->t('Minimum age to allow self registration'),
      '#default_value' => $config['ageLimit'] ?? '18',
      '#min' => 1,
      '#step' => 1,
    ];

    $form['redirect_on_user_created_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Redirect on create'),
      '#description' => $this->t('Redirect to this on user successful created'),
      '#default_value' => $config['redirectOnUserCreatedUrl'] ?? '',
    ];

    $form['information'] = [
      '#type' => 'text_format',
      '#title' => $this->t('Information page'),
      '#default_value' => $config['information']['value'] ?? '',
      '#format' => $config['information']['format'] ?? 'plain_text',
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    parent::submitForm($form, $form_state);
    $this->config($this->configService->getConfigKey())
      ->set('ageLimit', $form_state->getValue('age_limit'))
      ->set('information', $form_state->getValue('information'))
      ->save();
  }

}
