<?php

namespace Drupal\dpl_link\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\link\Plugin\Field\FieldType\LinkItem;
use Drupal\linkit\Plugin\Field\FieldWidget\LinkitWidget;

/**
 * Plugin implementation of the 'dpl_link_options' widget.
 *
 * @FieldWidget(
 *   id = "dpl_link_options",
 *   label = @Translation("DPL Linkit with options"),
 *   field_types = {
 *     "link"
 *   }
 * )
 */
class LinkitOptionsWidget extends LinkitWidget {

  /**
   * {@inheritDoc}
   *
   * @return array<mixed>
   *   See LinkitWidget.
   */
  public static function defaultSettings(): array {
    return [
      'target_blank' => 0,
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritDoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state): array {
    $element = parent::formElement($items, $delta, $element, $form, $form_state);
    $item = $items[$delta] ?? NULL;
    $target = 'self';

    if ($item instanceof LinkItem) {
      $target = $item->getValue()['options']['target'] ?? $target;
    }

    $element['target_blank'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Open link in new window/tab'),
      '#default_value' => ($target === '_blank'),
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

    foreach ($values as $delta => $value) {
      if (!empty($value['target_blank'])) {
        $values[$delta]['options']['target'] = '_blank';
      }
    }

    return $values;
  }

}
