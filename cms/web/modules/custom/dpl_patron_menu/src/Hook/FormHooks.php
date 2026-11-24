<?php

declare(strict_types=1);

namespace Drupal\dpl_patron_menu\Hook;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\dpl_patron_menu\DplMenuSettings;

/**
 * Form hooks for dpl_patron_menu module.
 */
class FormHooks {

  use StringTranslationTrait;

  /**
   * Constructor.
   */
  public function __construct(
    protected DplMenuSettings $patronMenuSettings,
    protected ConfigFactoryInterface $configFactory,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Add patron menu list size fields to the agency list size settings form.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  #[Hook('form_dpl_library_agency_list_size_settings_form_alter')]
  public function addPatronMenuListSizeSettings(array &$form, FormStateInterface $form_state): void {
    $form['patron_menu_list_size_settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Patron menu list size settings', [], ['context' => 'List size (settings)']),
      '#description' => $this->t('The number of items to display in the patron menu list.', [], ['context' => 'List size (settings)']),
      '#tree' => FALSE,
    ];

    $form['patron_menu_list_size_settings']['patron_menu_list_size_desktop'] = [
      '#type' => 'number',
      '#title' => $this->t('Patron menu list size on desktop', [], ['context' => 'List size (settings)']),
      '#default_value' => $this->patronMenuSettings->getListSizeDesktop(),
      '#min' => 1,
      '#step' => 1,
      '#required' => TRUE,
    ];

    $form['patron_menu_list_size_settings']['patron_menu_list_size_mobile'] = [
      '#type' => 'number',
      '#title' => $this->t('Patron menu list size on mobile', [], ['context' => 'List size (settings)']),
      '#default_value' => $this->patronMenuSettings->getListSizeMobile(),
      '#min' => 1,
      '#step' => 1,
      '#required' => TRUE,
    ];

    $form['#submit'][] = static::class . ':submitPatronMenuListSizeSettings';
  }

  /**
   * Save the patron menu list sizes to the patron menu config.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  public function submitPatronMenuListSizeSettings(array &$form, FormStateInterface $form_state): void {
    $this->configFactory
      ->getEditable($this->patronMenuSettings->getConfigKey())
      ->set('patron_menu_list_size_desktop', $form_state->getValue('patron_menu_list_size_desktop'))
      ->set('patron_menu_list_size_mobile', $form_state->getValue('patron_menu_list_size_mobile'))
      ->save();
  }

}
