<?php

declare(strict_types = 1);

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
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state): array {

    $uniqueFieldId = $items->getFieldDefinition()->getUniqueIdentifier();
    $identifier = "{$uniqueFieldId}-{$delta}";

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
        'previously-selected-work-id' => $items[$delta]->value ?? NULL,
        'previously-selected-material-type' => $items[$delta]->material_type ?? NULL,
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
