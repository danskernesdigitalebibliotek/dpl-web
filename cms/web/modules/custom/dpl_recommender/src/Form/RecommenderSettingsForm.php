<?php

namespace Drupal\dpl_recommender\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Recommender setting form.
 */
class RecommenderSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return [
      'recommender.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'recommender_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config('recommender.settings');

    $form['settings']['search_text'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Search text', [], ['context' => 'Recommender (settings)']),
      '#description' => $this->t('Search text for recommender when no loan/no reservation', [], ['context' => 'Recommender (settings)']),
      '#default_value' => $config->get('search_text') ?? '',
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    parent::submitForm($form, $form_state);

    $this->config('recommender.settings')
      ->set('search_text', $form_state->getValue('search_text'))
      ->save();
  }

}
