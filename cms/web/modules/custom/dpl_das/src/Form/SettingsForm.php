<?php

namespace Drupal\dpl_das\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;

/**
 * Configure Digital Archive Service settings for this site.
 */
class SettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'dpl_das_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['dpl_das.settings'];
  }

  /**
   * Translates a string to the current language or to a given language.
   *
   * @param string $string
   *   A string containing the English text to translate.
   * @param mixed[] $args
   *   Replacements to make after translation. Based on the first character of
   *   the key, the value is escaped and/or themed.
   * @param mixed[] $options
   *   An associative array of additional options.
   */
  protected function t($string, array $args = [], array $options = []): TranslatableMarkup {
    // Intentionally transfer the string originally passed to t().
    // phpcs:ignore Drupal.Semantics.FunctionT.NotLiteralString
    return parent::t($string, $args, array_merge($options, ['context' => 'Digital Article Service']));
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['webservice'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Webservice integration'),
    ];
    $form['webservice']['url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Url'),
      '#description' => $this->t('The service endpoint for "placeCopyRequest"'),
      '#default_value' => $this->config('dpl_das.settings')->get('url') ?? "https://webservice.statsbiblioteket.dk/elba-webservices/services/placecopyrequest",
    ];
    $form['webservice']['username'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Username'),
      '#description' => $this->t('The username required to use the webservice.'),
      '#default_value' => $this->config('dpl_das.settings')->get('username'),
    ];
    $form['webservice']['password'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Password'),
      '#description' => $this->t('The password required to use the webservice.'),
      '#default_value' => $this->config('dpl_das.settings')->get('password'),
    ];
    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) : void {
    $this->config('dpl_das.settings')
      ->set('url', $form_state->getValue('url'))
      ->set('username', $form_state->getValue('username'))
      ->set('password', $form_state->getValue('password'))
      ->save();
    parent::submitForm($form, $form_state);
  }

}
