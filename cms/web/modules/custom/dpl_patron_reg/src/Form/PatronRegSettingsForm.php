<?php

namespace Drupal\dpl_patron_reg\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * PatronRegSettingsForm setting form.
 */
class PatronRegSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return [
      'dpl_patron_reg.settings',
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
    $config = $this->config('dpl_patron_reg.settings');

    $form['age_limit'] = [
      '#type' => 'number',
      '#title' => $this->t('Minimum age to allow self registration'),
      '#default_value' => $config->get('age_limit') ?? '18',
      '#min' => 1,
      '#step' => 1,
    ];

    $form['redirect_on_user_created_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Redirect on create'),
      '#description' => $this->t('Redirect to this on user successful created'),
      '#default_value' => $config->get('redirect_on_user_created_url') ?? '',
    ];

    $form['information'] = [
      '#type' => 'text_format',
      '#title' => $this->t('Information page'),
      '#default_value' => $config->get('information')['value'] ?? '',
      '#format' => $config->get('information')['format'] ?? 'plain_text',
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $feesUrl = $form_state->getValue('redirect_on_user_created_url');
    if (!filter_var($feesUrl, FILTER_VALIDATE_URL)) {
      $form_state->setErrorByName('redirect_on_user_created_url', $this->t('The url "%url" is not a valid URL.', ['%url' => $feesUrl], ['context' => 'Loan list (settings)']));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    parent::submitForm($form, $form_state);
    $this->config('dpl_patron_reg.settings')
      ->set('age_limit', $form_state->getValue('age_limit'))
      ->set('information', $form_state->getValue('information'))
      ->save();
  }

}
