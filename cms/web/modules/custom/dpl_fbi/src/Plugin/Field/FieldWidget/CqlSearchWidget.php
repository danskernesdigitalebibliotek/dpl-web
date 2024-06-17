<?php

namespace Drupal\dpl_fbi\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'cql_search_widget' widget.
 *
 * @FieldWidget(
 *   id = "cql_search_widget",
 *   label = @Translation("CQL Search Widget"),
 *   field_types = {
 *     "dpl_fbi_cql_search"
 *   }
 * )
 */
class CqlSearchWidget extends WidgetBase {

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $element['value'] = [
      '#type' => 'textfield',
      '#default_value' => $items[$delta]->value ?? '',
      '#maxlength' => 16000,
      '#title' => $this->t('CQL Search String'),
      '#placeholder' => $this->t('Enter CQL search string'),
      '#description' => $this->t('CQL search string field. Perform an advanced search and copy/paste the string to this field.'),
    ];

    return $element;
  }

}
