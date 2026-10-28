<?php

declare(strict_types=1);

namespace Drupal\dpl_favorites_list\Hook;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\dpl_favorites_list\DplFavoritesListSettings;

/**
 * Form hooks for dpl_favorites_list module.
 */
class FormHooks {

  use StringTranslationTrait;

  /**
   * Constructor.
   */
  public function __construct(
    protected DplFavoritesListSettings $favoritesSettings,
    protected ConfigFactoryInterface $configFactory,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Add favorites list size fields to the agency list size settings form.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  #[Hook('form_dpl_library_agency_list_size_settings_form_alter')]
  public function addFavoritesListSizeSettings(array &$form, FormStateInterface $form_state): void {
    $form['favorites_list_size_settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Favorites list size settings', [], ['context' => 'List size (settings)']),
      '#description' => $this->t('The number of items to display in the favorites list.', [], ['context' => 'List size (settings)']),
      '#tree' => FALSE,
    ];

    $form['favorites_list_size_settings']['favorites_list_size_desktop'] = [
      '#type' => 'number',
      '#title' => $this->t('Favorites list size on desktop', [], ['context' => 'List size (settings)']),
      '#default_value' => $this->favoritesSettings->getListSizeDesktop(),
      '#min' => 1,
      '#step' => 1,
      '#required' => TRUE,
    ];

    $form['favorites_list_size_settings']['favorites_list_size_mobile'] = [
      '#type' => 'number',
      '#title' => $this->t('Favorites list size on mobile', [], ['context' => 'List size (settings)']),
      '#default_value' => $this->favoritesSettings->getListSizeMobile(),
      '#min' => 1,
      '#step' => 1,
      '#required' => TRUE,
    ];

    $form['#submit'][] = static::class . ':submitFavoritesListSizeSettings';
  }

  /**
   * Save the favorites list sizes to the favorites list config.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  public function submitFavoritesListSizeSettings(array &$form, FormStateInterface $form_state): void {
    $this->configFactory
      ->getEditable($this->favoritesSettings->getConfigKey())
      ->set('favorites_list_size_desktop', $form_state->getValue('favorites_list_size_desktop'))
      ->set('favorites_list_size_mobile', $form_state->getValue('favorites_list_size_mobile'))
      ->save();
  }

}
