<?php

namespace Drupal\dpl_identity\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Defines a form for setting identity configuration.
 */
class IdentityConfigForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'dpl_identity.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'dpl_identity_config_form';
  }

  /**
   * Builds the form.
   *
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    // Load existing configuration for the form.
    $config = $this->config('dpl_identity.settings');

    $form['identity_color'] = [
      '#type' => 'color',
      '#title' => $this->t('Identity Color', [], ['context' => 'Identity settings']),
      '#default_value' => $config->get('identity_color'),
      '#description' => $this->t('Choose library identity color.', [], ['context' => 'Identity settings']),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * Form submission handler.
   *
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    // Save the configuration.
    $this->config('dpl_identity.settings')
      ->set('identity_color', $form_state->getValue('identity_color'))
      ->save();

    parent::submitForm($form, $form_state);
  }

}
