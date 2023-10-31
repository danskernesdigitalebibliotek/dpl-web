<?php

namespace Drupal\dpl_fbs\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * FBS setting form.
 */
class FbsSettingsForm extends ConfigFormBase {
  const CONFIG_KEY = 'dpl_fbs.settings';

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return [
      self::CONFIG_KEY,
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
    $config = $this->config(self::CONFIG_KEY);

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

    $this->config(self::CONFIG_KEY)
      ->set('base_url', $form_state->getValue('base_url'))
      ->save();
  }

}
