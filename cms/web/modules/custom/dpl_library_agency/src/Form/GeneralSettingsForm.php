<?php

namespace Drupal\dpl_library_agency\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * General Settings form for a library agency.
 */
class GeneralSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'dpl_library_agency_general_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'dpl_library_agency.general_settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config('dpl_library_agency.general_settings');

    $form['reservations'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Reservations'),
      '#collapsible' => FALSE,
      '#collapsed' => FALSE,
    ];

    $form['reservations']['reservation_sms_notifications_disabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Disable SMS notifications for reservations'),
      '#default_value' => $config->get('reservation_sms_notifications_disabled'),
      '#description' => $this->t('If checked, SMS notifications for patrons will be disabled.'),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->config('dpl_library_agency.general_settings')
      ->set('library_agency_name', $form_state->getValue('library_agency_name'))
      ->set('reservation_sms_notifications_disabled', $form_state->getValue('reservation_sms_notifications_disabled'))
      ->save();

    parent::submitForm($form, $form_state);
  }

}
