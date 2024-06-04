<?php

namespace Drupal\dpl_mapp\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure Mapp Intelligence settings for this site.
 */
class SettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'dpl_mapp_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return ['dpl_mapp.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $form['domain'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Domain', [], ['context' => 'Dpl Mapp']),
      '#description' => $this->t('Specify the Tag Integration domain if the JavaScript-file should be loaded from the Mapp server.', [], ['context' => 'Dpl Mapp']),
      '#default_value' => $this->config('dpl_mapp.settings')->get('domain'),
      '#required' => TRUE,
    ];
    $form['id'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Id', [], ['context' => 'Dpl Mapp']),
      '#description' => $this->t('Enter your Tag Integration customer ID if the JavaScript-file should be loaded from the Mapp server.', [], ['context' => 'Dpl Mapp']),
      '#default_value' => $this->config('dpl_mapp.settings')->get('id'),
      '#required' => TRUE,
    ];
    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->config('dpl_mapp.settings')
      ->set('domain', $form_state->getValue('domain'))
      ->set('id', $form_state->getValue('id'))
      ->save();
    parent::submitForm($form, $form_state);
  }

}
