<?php

namespace Drupal\dpl_link\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\link\Plugin\Field\FieldType\LinkItem;
use Drupal\linkit\Plugin\Field\FieldWidget\LinkitWidget;

/**
 * Plugin implementation of the 'dpl_link_go_options' widget.
 *
 * @FieldWidget(
 *   id = "dpl_link_go_options",
 *   label = @Translation("DPL Linkit with GO options"),
 *   field_types = {
 *     "link"
 *   }
 * )
 */
class LinkitGoOptionsWidget extends LinkitWidget {

  /**
   * {@inheritDoc}
   *
   * @return array<mixed>
   *   See LinkitWidget.
   */
  public static function defaultSettings(): array {
    return [
      'target_blank' => 0,
      'aria_label' => '',
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritDoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state): array {
    $element = parent::formElement($items, $delta, $element, $form, $form_state);
    $item = $items[$delta] ?? NULL;
    $target = 'self';
    $existing_aria_label = '';

    if ($item instanceof LinkItem) {
      $link_value = $item->getValue();
      if (isset($link_value['options']['target'])) {
        $target = $link_value['options']['target'];
      }
      if (!empty($link_value['options']['attributes']['aria-label'])) {
        $existing_aria_label = $link_value['options']['attributes']['aria-label'];
      }
    }

    $element['target_blank'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Open link in new window/tab'),
      '#default_value' => ($target === '_blank'),
    ];

    $element['aria_label'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Aria Label'),
      '#description' => $this->t('Optional: Add custom aria-label for accessibility.'),
      '#default_value' => $existing_aria_label,
    ];

    return $element;
  }

  /**
   * {@inheritDoc}
   *
   * @param array<mixed> $values
   *   See LinkitWidget.
   * @param array<mixed> $form
   *   See LinkitWidget.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   See LinkitWidget.
   *
   * @return array<mixed>
   *   See LinkitWidget.
   */
  public function massageFormValues(array $values, array $form, FormStateInterface $form_state): array {
    $values = parent::massageFormValues($values, $form, $form_state);

    foreach ($values as &$value) {
      if (!empty($value['target_blank'])) {
        $value['options']['target'] = '_blank';
      }

      if (!empty($value['aria_label'])) {
        $value['options']['attributes']['aria-label'] = $value['aria_label'];
      }
      // Clean up to ensure no extraneous form element is saved accidentally.
      unset($value['target_blank']);
      unset($value['aria_label']);
    }

    return $values;
  }

}
