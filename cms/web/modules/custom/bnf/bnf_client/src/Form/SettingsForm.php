<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use function Safe\preg_match;

/**
 * BNF client configuration form.
 */
class SettingsForm extends ConfigFormBase {

  const CONFIG_NAME = 'bnf_client.settings';

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return [
      self::CONFIG_NAME,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'bnf_client_settings';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {

    $form['bnf_client'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('BNF configuration'),
      '#tree' => FALSE,
    ];

    $form['bnf_client']['base_url'] = [
      '#type' => 'textfield',
      '#size' => 100,
      '#title' => $this->t('BNF server URL'),
      '#description' => $this->t('For example <em>https://bibliotekernesnationaleformidling.dk/</em>.'),
      '#default_value' => $this->config(self::CONFIG_NAME)->get('base_url'),
      '#required' => TRUE,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $url = $form_state->getValue('base_url');
    $element = $form['bnf_client']['base_url'];

    // This doesn't support IDN names like `jøsses.dk`, but we'll live with that
    // for the moment being.
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
      $form_state->setError($element, $this->t('Please enter a valid URL.'));
    }

    if (!preg_match('/^https:/', $url)) {
      $form_state->setError($element, $this->t('Only HTTPS is supported.'));
    }

    if (mb_substr($url[-1], -1) !== '/') {
      $form_state->setError($element, $this->t('URL must end with a /.'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    parent::submitForm($form, $form_state);

    $this->config(self::CONFIG_NAME)
      ->set('base_url', $form_state->getValue('base_url'))
      ->save();
  }

}
