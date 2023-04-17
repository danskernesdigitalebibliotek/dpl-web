<?php

namespace Drupal\dpl_patron_page\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Patron page setting form.
 */
class PatronPageSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return [
      'patron_page.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'patron_page_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config('patron_page.settings');

    $form['settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Basic settings'),
      '#tree' => FALSE,
    ];

    $form['settings']['text_notifications_enabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable SMS notifications'),
      '#default_value' => $config->get('text_notifications_enabled'),
    ];

    $form['settings']['delete_patron_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Delete patron link'),
      '#description' => $this->t('Link to a page where it is possible to delete patron'),
      '#default_value' => $config->get('delete_patron_url') ?? '',
    ];

    $form['settings']['always_available_ereolen'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Ereolen always available'),
      '#default_value' => $config->get('always_available_ereolen') ?? '',
    ];

    $form['settings']['pincode_length_min'] = [
      '#type' => 'number',
      '#title' => $this->t('Pincode length (min)'),
      '#default_value' => $config->get('pincode_length_min') ?? 4,
      '#min' => 4,
      '#step' => 1,
    ];

    $form['settings']['pincode_length_max'] = [
      '#type' => 'number',
      '#title' => $this->t('Pincode length max'),
      '#default_value' => $config->get('pincode_length_max') ?? 4,
      '#min' => 4,
      '#step' => 1,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $feesUrl = $form_state->getValue('delete_patron_url');
    if (!filter_var($feesUrl, FILTER_VALIDATE_URL)) {
      $form_state->setErrorByName('delete_patron_url', $this->t('The url "%url" is not a valid URL.', ['%url' => $feesUrl]));
    }

    $materialUrl = $form_state->getValue('always_available_ereolen');
    if (!filter_var($materialUrl, FILTER_VALIDATE_URL)) {
      $form_state->setErrorByName('always_available_ereolen', $this->t('The url "%url" is not a valid URL.', ['%url' => $materialUrl]));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    parent::submitForm($form, $form_state);

    $this->config('patron_page.settings')
      ->set('delete_patron_url', $form_state->getValue('delete_patron_url'))
      ->set('always_available_ereolen', $form_state->getValue('always_available_ereolen'))
      ->set('text_notifications_enabled', $form_state->getValue('text_notifications_enabled'))
      ->set('pincode_length_min', $form_state->getValue('pincode_length_min'))
      ->set('pincode_length_max', $form_state->getValue('pincode_length_max'))
      ->save();
  }

}
