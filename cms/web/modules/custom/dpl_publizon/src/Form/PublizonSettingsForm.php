<?php

namespace Drupal\dpl_publizon\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Publizon setting form.
 */
class PublizonSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return [
      'dpl_publizon.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'dpl_publizon_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config('dpl_publizon.settings');

    $form['settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Basic settings', [], ['context' => 'Dpl Publizon']),
      '#tree' => FALSE,
    ];

    $form['settings']['base_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Publizon service url', [], ['context' => 'Dpl Publizon']),
      '#default_value' => $config->get('base_url'),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $url = $form_state->getValue('base_url');
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
      $form_state->setErrorByName('base_url', $this->t(
        'The url "%url" is not a valid URL.',
        ['%url' => $url],
        ['context' => 'Dpl Publizon']
      ));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    parent::submitForm($form, $form_state);
    $this->config('dpl_publizon.settings')
      ->set('base_url', $form_state->getValue('base_url'))
      ->save();
  }

}
