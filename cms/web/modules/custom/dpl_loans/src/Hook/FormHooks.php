<?php

declare(strict_types=1);

namespace Drupal\dpl_loans\Hook;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\dpl_loans\DplLoansSettings;

/**
 * Form hooks for dpl_loans module.
 */
class FormHooks {

  use StringTranslationTrait;

  /**
   * Constructor.
   */
  public function __construct(
    protected DplLoansSettings $loansSettings,
    protected ConfigFactoryInterface $configFactory,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Add loan list size fields to the agency list size settings form.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  #[Hook('form_dpl_library_agency_list_size_settings_form_alter')]
  public function addLoanListSizeSettings(array &$form, FormStateInterface $form_state): void {
    $form['loan_list_size_settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Loan list size settings', [], ['context' => 'List size (settings)']),
      '#description' => $this->t('The number of items to display in the loan list.', [], ['context' => 'List size (settings)']),
      '#tree' => FALSE,
    ];

    $form['loan_list_size_settings']['loan_list_size_desktop'] = [
      '#type' => 'number',
      '#title' => $this->t('Loan list size on desktop', [], ['context' => 'List size (settings)']),
      '#default_value' => $this->loansSettings->getListSizeDesktop(),
      '#min' => 1,
      '#step' => 1,
      '#required' => TRUE,
    ];

    $form['loan_list_size_settings']['loan_list_size_mobile'] = [
      '#type' => 'number',
      '#title' => $this->t('Loan list size on mobile', [], ['context' => 'List size (settings)']),
      '#default_value' => $this->loansSettings->getListSizeMobile(),
      '#min' => 1,
      '#step' => 1,
      '#required' => TRUE,
    ];

    $form['#submit'][] = static::class . ':submitLoanListSizeSettings';
  }

  /**
   * Save the loan list sizes to the loans config.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  public function submitLoanListSizeSettings(array &$form, FormStateInterface $form_state): void {
    $this->configFactory
      ->getEditable($this->loansSettings->getConfigKey())
      ->set('loan_list_size_desktop', $form_state->getValue('loan_list_size_desktop'))
      ->set('loan_list_size_mobile', $form_state->getValue('loan_list_size_mobile'))
      ->save();
  }

}
