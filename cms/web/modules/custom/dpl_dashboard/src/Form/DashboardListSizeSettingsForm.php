<?php

namespace Drupal\dpl_dashboard\Form;

use Drupal\Core\Form\FormStateInterface;
use Drupal\dpl_list_size\Form\ListSizeSettingsForm;
use Drupal\dpl_list_size\DplListSizeSettings;

/**
 * Dashboard list size settings form.
 */
class DashboardListSizeSettingsForm extends ListSizeSettingsForm {

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->configService->loadConfig();

    $form['dashboard_list_size_settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Dashboard list size settings', [], ['context' => 'List size (settings)']),
      '#description' => $this->t('The number of items to display in the dashboard list.', [], ['context' => 'List size (settings)']),
      '#tree' => FALSE,
    ];

    $form['dashboard_list_size_settings']['dashboard_list_size_desktop'] = [
      '#type' => 'number',
      '#title' => $this->t('Dashboard list size on desktop', [], ['context' => 'List size (settings)']),
      '#default_value' => $config->get('dashboard_list_size_desktop') ?? DplListSizeSettings::DASHBOARD_LIST_SIZE_DESKTOP,
      '#min' => 1,
      '#step' => 1,
    ];

    $form['dashboard_list_size_settings']['dashboard_list_size_mobile'] = [
      '#type' => 'number',
      '#title' => $this->t('Dashboard list size on mobile', [], ['context' => 'List size (settings)']),
      '#default_value' => $config->get('dashboard_list_size_mobile') ?? DplListSizeSettings::DASHBOARD_LIST_SIZE_MOBILE,
      '#min' => 1,
      '#step' => 1,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    parent::submitForm($form, $form_state);
    $this->config($this->configService->getConfigKey())
      ->set('dashboard_list_size_desktop', $form_state->getValue('dashboard_list_size_desktop'))
      ->set('dashboard_list_size_mobile', $form_state->getValue('dashboard_list_size_mobile'))
      ->save();
  }
}
