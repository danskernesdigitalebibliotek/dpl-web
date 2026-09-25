<?php

declare(strict_types=1);

namespace Drupal\dpl_service_message\Plugin\Field\FieldWidget;

use Drupal\Core\Field\Attribute\FieldWidget;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\Plugin\Field\FieldWidget\StringTextareaWidget;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;

/**
 * Core's text area widget, for `string` fields.
 *
 * Core only offers `string_textarea` for `string_long`, which has no maximum
 * length. The service message body needs both: a text area so the editor can
 * see the whole message, and the 255 character limit of a `string` field.
 */
#[FieldWidget(
  id: 'dpl_service_message_plain_textarea',
  label: new TranslatableMarkup('Text area (multiple rows)'),
  field_types: ['string'],
)]
class PlainTextareaWidget extends StringTextareaWidget {

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state): array {
    $element = parent::formElement($items, $delta, $element, $form, $form_state);

    $max_length = $this->fieldDefinition->getFieldStorageDefinition()->getSetting('max_length');

    if (is_numeric($max_length)) {
      $element['value']['#maxlength'] = (int) $max_length;
    }

    return $element;
  }

}
