<?php

namespace Drupal\dpl_menu\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Menu setting form.
 */
class MenuSettingsForm extends ConfigFormBase
{

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array
  {
    return [
      'dpl_menu.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string
  {
    return 'menu_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array
  {
    $config = $this->config('dpl_menu.settings');

    $form['settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Basic settings'),
      '#tree' => FALSE,
    ];


    $form['settings']['menu_navigation_data_config'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Menu Navigation Data Config'),
      '#description' => $this->t('JSON definition of menu data'),
      '#default_value' => $config->get('menu_navigation_data_config') ?? '',
    ];


    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void
  {
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void
  {
    parent::submitForm($form, $form_state);

    $this->config('dpl_menu.settings')
      ->set('menu_navigation_data_config', $form_state->getValue('menu_navigation_data_config'))
      ->save();
  }
}
