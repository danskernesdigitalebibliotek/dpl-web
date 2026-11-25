<?php

declare(strict_types=1);

namespace Drupal\dpl_reservations\Hook;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\dpl_reservations\DplReservationsSettings;

/**
 * Form hooks for dpl_reservations module.
 */
class FormHooks {

  use StringTranslationTrait;

  /**
   * Constructor.
   */
  public function __construct(
    protected DplReservationsSettings $reservationsSettings,
    protected ConfigFactoryInterface $configFactory,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Add reservations list size fields to the agency list size settings form.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  #[Hook('form_dpl_library_agency_list_size_settings_form_alter')]
  public function addReservationsListSizeSettings(array &$form, FormStateInterface $form_state): void {
    $form['reservations_list_size_settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Reservations list size settings', [], ['context' => 'List size (settings)']),
      '#description' => $this->t('The number of items to display in the reservation list.', [], ['context' => 'List size (settings)']),
      '#tree' => FALSE,
    ];

    $form['reservations_list_size_settings']['reservations_list_size_desktop'] = [
      '#type' => 'number',
      '#title' => $this->t('Reservations list size on desktop', [], ['context' => 'List size (settings)']),
      '#default_value' => $this->reservationsSettings->getListSizeDesktop(),
      '#min' => 1,
      '#step' => 1,
      '#required' => TRUE,
    ];

    $form['reservations_list_size_settings']['reservations_list_size_mobile'] = [
      '#type' => 'number',
      '#title' => $this->t('Reservations list size on mobile', [], ['context' => 'List size (settings)']),
      '#default_value' => $this->reservationsSettings->getListSizeMobile(),
      '#min' => 1,
      '#step' => 1,
      '#required' => TRUE,
    ];

    $form['#submit'][] = static::class . ':submitReservationsListSizeSettings';
  }

  /**
   * Save the reservations list sizes to the reservations config.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  public function submitReservationsListSizeSettings(array &$form, FormStateInterface $form_state): void {
    $this->configFactory
      ->getEditable($this->reservationsSettings->getConfigKey())
      ->set('reservations_list_size_desktop', $form_state->getValue('reservations_list_size_desktop'))
      ->set('reservations_list_size_mobile', $form_state->getValue('reservations_list_size_mobile'))
      ->save();
  }

}
