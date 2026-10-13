<?php

declare(strict_types=1);

namespace Drupal\dpl_dashboard\Hook;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\dpl_dashboard\DplDashboardSettings;

/**
 * Form hooks for dpl_dashboard module.
 */
class FormHooks {

  use StringTranslationTrait;

  /**
   * Constructor.
   */
  public function __construct(
    protected DplDashboardSettings $dashboardSettings,
    protected ConfigFactoryInterface $configFactory,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Add list size settings to the dpl library agency list form.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  #[Hook('form_dpl_library_agency_list_size_settings_form_alter')]
  public function addDashboardListSizeSettings(array &$form, FormStateInterface $form_state): void {
    $form['dashboard_list_size_settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Dashboard list size settings', [], ['context' => 'List size (settings)']),
      '#description' => $this->t('The number of items to display in the dashboard list.', [], ['context' => 'List size (settings)']),
      '#tree' => FALSE,
    ];

    $form['dashboard_list_size_settings']['dashboard_list_size_desktop'] = [
      '#type' => 'number',
      '#title' => $this->t('Dashboard list size on desktop', [], ['context' => 'List size (settings)']),
      '#default_value' => $this->dashboardSettings->getListSizeDesktop(),
      '#min' => 1,
      '#step' => 1,
      '#required' => TRUE,
    ];

    $form['dashboard_list_size_settings']['dashboard_list_size_mobile'] = [
      '#type' => 'number',
      '#title' => $this->t('Dashboard list size on mobile', [], ['context' => 'List size (settings)']),
      '#default_value' => $this->dashboardSettings->getListSizeMobile(),
      '#min' => 1,
      '#step' => 1,
      '#required' => TRUE,
    ];

    $form['#submit'][] = static::class . ':submitDashboardListSizeSettings';
  }

  /**
   * Custom submit callback.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  public function submitDashboardListSizeSettings(array &$form, FormStateInterface $form_state): void {
    $this->configFactory
      ->getEditable($this->dashboardSettings->getConfigKey())
      ->set('dashboard_list_size_desktop', $form_state->getValue('dashboard_list_size_desktop'))
      ->set('dashboard_list_size_mobile', $form_state->getValue('dashboard_list_size_mobile'))
      ->save();
  }

}
