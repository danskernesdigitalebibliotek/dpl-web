<?php

namespace Drupal\dpl_instant_loan\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Instant Loan settings form.
 */
class DplInstantLoanSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return [
      'dpl_instant_loan.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'dpl_instant_loan_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('dpl_instant_loan.settings');

    $form['enabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enabled', [], ['context' => 'dpl_instant_loan']),
      '#description' => $this->t(
        'Should materials available for instant loans be promoted to patrons?',
        [],
        ['context' => 'dpl_instant_loan']
      ),
      '#default_value' => $config->get('enabled'),
    ];

    $form['match_string'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Match String', [], ['context' => 'dpl_instant_loan']),
      '#description' => $this->t(
        'Text used to identify materials which are available for instant loans. This text must be present in the material group of such materials.',
        [],
        ['context' => 'dpl_instant_loan']
      ),
      '#default_value' => $config->get('match_string'),
    ];

    $form['threshold'] = [
      '#type' => 'number',
      '#title' => $this->t('Threshold', [], ['context' => 'dpl_instant_loan']),
      '#description' => $this->t(
        'The minimum number of materials which must be available for instant loan at a library branch to notify patrons of the option when making reservations.',
        [],
        ['context' => 'dpl_instant_loan']
      ),
      '#default_value' => $config->get('threshold'),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->config('dpl_instant_loan.settings')
      ->set('enabled', $form_state->getValue('enabled'))
      ->set('match_string', $form_state->getValue('match_string'))
      ->set('threshold', $form_state->getValue('threshold'))
      ->save();

    parent::submitForm($form, $form_state);
  }

}
