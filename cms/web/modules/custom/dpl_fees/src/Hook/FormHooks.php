<?php

declare(strict_types=1);

namespace Drupal\dpl_fees\Hook;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\dpl_fees\DplFeesSettings;

/**
 * Form hooks for dpl_fees module.
 */
class FormHooks {

  use StringTranslationTrait;

  /**
   * Constructor.
   */
  public function __construct(
    protected DplFeesSettings $feesSettings,
    protected ConfigFactoryInterface $configFactory,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Add fees list size fields to the agency list size settings form.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  #[Hook('form_dpl_library_agency_list_size_settings_form_alter')]
  public function addFeesListSizeSettings(array &$form, FormStateInterface $form_state): void {
    $form['fees_list_size_settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Fees list size settings', [], ['context' => 'List size (settings)']),
      '#description' => $this->t('The number of items to display in the fees list.', [], ['context' => 'List size (settings)']),
      '#tree' => FALSE,
    ];

    $form['fees_list_size_settings']['fees_list_size_desktop'] = [
      '#type' => 'number',
      '#title' => $this->t('Fees list size on desktop', [], ['context' => 'List size (settings)']),
      '#default_value' => $this->feesSettings->getListSizeDesktop(),
      '#min' => 1,
      '#step' => 1,
      '#required' => TRUE,
    ];

    $form['fees_list_size_settings']['fees_list_size_mobile'] = [
      '#type' => 'number',
      '#title' => $this->t('Fees list size on mobile', [], ['context' => 'List size (settings)']),
      '#default_value' => $this->feesSettings->getListSizeMobile(),
      '#min' => 1,
      '#step' => 1,
      '#required' => TRUE,
    ];

    $form['#submit'][] = static::class . ':submitFeesListSizeSettings';
  }

  /**
   * Save the fees list sizes to the fees config.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  public function submitFeesListSizeSettings(array &$form, FormStateInterface $form_state): void {
    $this->configFactory
      ->getEditable($this->feesSettings->getConfigKey())
      ->set('fees_list_size_desktop', $form_state->getValue('fees_list_size_desktop'))
      ->set('fees_list_size_mobile', $form_state->getValue('fees_list_size_mobile'))
      ->save();
  }

}
