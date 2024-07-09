<?php

declare(strict_types=1);

namespace Drupal\dpl_fbi\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\dpl_react_apps\Controller\DplReactAppsController;

/**
 * Defines the 'dpl_fbi_work_id_search_for_material' field widget.
 *
 * @FieldWidget(
 *   id = "dpl_fbi_work_id_search_for_material",
 *   label = @Translation("Work ID search for material"),
 *   field_types = {"dpl_fbi_work_id"},
 * )
 */
final class WorkIdSearchForMaterialWidget extends WidgetBase {

  /**
   * {@inheritdoc}
   *
   * @throws \Random\RandomException
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state): array {

    $identifier = bin2hex(random_bytes(16));

    $element['fields_container'] = [
      '#type' => 'container',
      '#attributes' => [
        'class' => ['material-search__inputs-container--hidden'],
      ],
    ];

    $element['fields_container']['value'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Field work ID'),
      '#default_value' => $items[$delta]->value ?? '',
      '#attributes' => [
        'data-field-input-work-id' => $identifier,
      ],
    ];

    $element['fields_container']['material_type'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Field material type'),
      '#default_value' => $items[$delta]->material_type ?? '',
      '#attributes' => [
        'data-field-input-material-type-id' => $identifier,
      ],
    ];

    $element['react_app_container'] = [
      '#type' => 'container',
      '#theme' => 'dpl_react_app',
      '#name' => 'material-search',
      '#data' => [
        'class' => ['react-app-container'],
        'unique-identifier' => $identifier,
        'material-search-search-input-text' => $this->t('Search for material', [], ['context' => 'Material search']),
        'material-search-material-type-selector-text' => $this->t('Select material type', [], ['context' => 'Material search']),
        'material-search-material-type-selector-none-option-text' => $this->t('Select material type', [], ['context' => 'Material search']),
        'material-search-no-material-selected-text' => $this->t('No material selected', [], ['context' => 'Material search']),
        'material-search-preview-title-text' => $this->t('Title', [], ['context' => 'Material search']),
        'material-search-preview-author-text' => $this->t('Author', [], ['context' => 'Material search']),
        'material-search-preview-publication-year-text' => $this->t('Publication year', [], ['context' => 'Material search']),
        'material-search-preview-source-text' => $this->t('Source', [], ['context' => 'Material search']),
        'material-search-preview-work-id-text' => $this->t('Work ID', [], ['context' => 'Material search']),
        'material-search-loading-text' => $this->t('Loading...', [], ['context' => 'Material search']),
        'material-search-amount-of-results-text' => $this->t('Total amount of results', [], ['context' => 'Material search']),
        'material-search-aria-button-select-work-with-text' => $this->t('Select work with the title @title', [], ['context' => 'Material search']),
        'material-search-search-input-placeholder-text' => $this->t('Search for material', [], ['context' => 'Material search']),
        'material-search-warning-title-text' => $this->t('Warning', [], ['context' => 'Material search']),
        'material-search-error-title-text' => $this->t('Title', [], ['context' => 'Material search']),
        'material-search-error-author-text' => $this->t('Author', [], ['context' => 'Material search']),
        'material-search-error-link-text' => $this->t('Link', [], ['context' => 'Material search']),
        'material-search-error-header-text' => $this->t('This material needs to be updated.', [], ['context' => 'Material search']),
        'material-search-error-material-type-not-found-text' => $this->t('The currently selected type of the material is no longer available in the system. <br> As a result of this, the link is likely broken. <br> Use the title or link underneath to find and update the material and its type, or replace / delete it.', [], ['context' => 'Material search']),
        'material-search-error-work-not-found-text' => $this->t('The material that was previously selected is no longer available in the system. Either delete this entry or search for a new material to replace it.', [], ['context' => 'Material search']),
        'material-search-error-hidden-inputs-not-found-heading-text' => $this->t('Error retrieving saved data. Inputs not found.', [], ['context' => 'Material search']),
        'material-search-error-hidden-inputs-not-found-description-text' => $this->t('Something went wrong when trying to find the previously saved values. Please try again. If the problem persists, something could be wrong with the app.', [], ['context' => 'Material search']),
      ] + DplReactAppsController::externalApiBaseUrls(),
    ];

    return $element;
  }

  /**
   * {@inheritdoc}
   *
   * @param array<string, array<string, mixed>> $values
   *   The values to be transformed.
   * @param array<string, mixed> $form
   *   The form definition.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   *
   * @return array<string, array<string, mixed>>
   *   The transformed values.
   */
  public function massageFormValues(array $values, array $form, FormStateInterface $form_state): array {
    foreach ($values as &$value) {
      if (isset($value['fields_container'])) {
        $value['value'] = $value['fields_container']['value'];
        $value['material_type'] = $value['fields_container']['material_type'];
        unset($value['fields_container']);
      }
    }
    return $values;
  }

}
