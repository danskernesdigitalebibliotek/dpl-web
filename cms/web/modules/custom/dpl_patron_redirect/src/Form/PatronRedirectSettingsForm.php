<?php

namespace Drupal\dpl_patron_redirect\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Publizon setting form.
 */
class PatronRedirectSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return [
      'dpl_patron_redirect.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'dpl_patron_redirect_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config('dpl_patron_redirect.settings');

    $form['settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Redirect settings', [], ['context' => 'Dpl patron redirect']),
      '#description' => $this->t('Set the paths that requires the patron to be logged in and if the user is not logged in an redirect to Adgangsplatformen will automatically be enforced.', [], ['context' => 'Dpl patron redirect']),
      '#tree' => FALSE,
    ];

    $form['settings']['pages'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Pages'),
      '#default_value' => $config->get('pages'),
      '#description' => $this->t("Specify pages by using their paths. Enter one path per line. The '*' character is a wildcard. An example path is %user-wildcard for every user page. %front is the front page.", [
        '%user-wildcard' => '/user/*',
        '%front' => '<front>',
      ]),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {

  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->config('dpl_patron_redirect.settings')
      ->set('pages', $form_state->getValue('pages'))
      ->save();
  }

}
