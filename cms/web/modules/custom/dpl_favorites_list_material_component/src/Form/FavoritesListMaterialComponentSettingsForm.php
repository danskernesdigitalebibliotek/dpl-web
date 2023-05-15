<?php

namespace Drupal\dpl_favorites_list_material_component\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Favorites list material component setting form.
 */
class FavoritesListMaterialComponentSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return [
      'favorites_list_material_component.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'favorites_list_material_component_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config('favorites_list_material_component.settings');

    $form['settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Basic settings', [], ['context' => 'Favorites list material component (settings)']),
      '#tree' => FALSE,
    ];

    $form['settings']['favorites_list_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Favorites list url', [], ['context' => 'Favorites list material component (settings)']),
      '#description' => $this->t('The link to the favorites list', [], ['context' => 'Favorites list material component (settings)']),
      '#default_value' => $config->get('favorites_list_url') ?? '',
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    parent::submitForm($form, $form_state);

    $this->config('favorites_list_material_component.settings')
      ->set('favorites_list_url', $form_state->getValue('favorites_list_url'))
      ->save();
  }

}
