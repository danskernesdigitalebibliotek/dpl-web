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

    $form['settings']['menu_login_link'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Login link'),
      '#description' => $this->t('Link to the place where the user logs in'),
      '#default_value' => $config->get('menu_login_link') ?? '',
    ];

    $form['settings']['menu_create_user_link'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Create user link'),
      '#description' => $this->t('Link to the place where the user creates a profile'),
      '#default_value' => $config->get('menu_create_user_link') ?? '',
    ];


    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void
  {
    $loginUrl = $form_state->getValue('menu_login_link');
    if (!filter_var($loginUrl, FILTER_VALIDATE_URL)) {
      $form_state->setErrorByName('menu_login_link', $this->t('The url "%url" is not a valid URL.', ['%url' => $loginUrl]));
    }
    $createUserUrl = $form_state->getValue('menu_create_user_link');
    if (!filter_var($loginUrl, FILTER_VALIDATE_URL)) {
      $form_state->setErrorByName('menu_create_user_link', $this->t('The url "%url" is not a valid URL.', ['%url' => $createUserUrl]));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void
  {
    parent::submitForm($form, $form_state);

    $this->config('dpl_menu.settings')
      ->set('menu_navigation_data_config', $form_state->getValue('menu_navigation_data_config'))
      ->set('menu_login_link', $form_state->getValue('menu_login_link'))
      ->set('menu_create_user_link', $form_state->getValue('menu_create_user_link'))
      ->save();
  }
}
