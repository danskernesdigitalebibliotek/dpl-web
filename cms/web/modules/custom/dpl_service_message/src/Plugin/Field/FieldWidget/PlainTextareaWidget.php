<?php

declare(strict_types=1);

namespace Drupal\dpl_service_message\Plugin\Field\FieldWidget;

use Drupal\Core\Field\Attribute\FieldWidget;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\Plugin\Field\FieldWidget\StringTextareaWidget;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;

/**
 * A text area for a plain, length-capped `string` field.
 *
 * The service message body is a `string` and stays one: plain text the
 * layout can hold, capped at the 255 characters the column gives it for
 * free (KB-63). What the editor needs is to see all of it at once, which a
 * single-line input does not do past ~80 characters - KB-63 again, after
 * the first round.
 *
 * Core has the widget for that, but `string_textarea` is declared for
 * `string_long` only, and that field type has no length of its own. So the
 * widget comes here instead of the cap moving into a custom constraint: the
 * same text area, offered to the field type that already carries a maximum.
 *
 * The output still ignores line breaks. A text area lets the editor type
 * one, and the message is drawn as a run of text either way.
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
      // As an attribute, not as `#maxlength`: the latter reaches the markup
      // of a textfield and not of a text area, so it would leave the browser
      // letting the editor type past a limit that only the field's own
      // validation then catches, on save.
      $element['value']['#attributes']['maxlength'] = (int) $max_length;
    }

    return $element;
  }

}
