<?php

namespace Drupal\media_videotool\Plugin\Field\FieldWidget;

use Drupal\Core\Field\Attribute\FieldWidget;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\Plugin\Field\FieldWidget\StringTextfieldWidget;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\media_videotool\Traits\HasVideoToolFeaturesTrait;

/**
 * Plugin implementation of the 'videotool_textfield' widget.
 */
#[FieldWidget(
  id: 'videotool_textfield',
  label: new TranslatableMarkup('VideoTool URL'),
  field_types: ['string'],
)]
class VideoToolWidget extends StringTextfieldWidget {

  use HasVideoToolFeaturesTrait;

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $element = parent::formElement($items, $delta, $element, $form, $form_state);

    $message = $this->t('VideoTool URL example: https://media.videotool.dk/?vn=557_2023103014511477700668916683');

    if (!empty($element['value']['#description'])) {
      $element['value']['#description'] = [
        '#theme' => 'item_list',
        '#items' => [$element['value']['#description'], $message],
      ];
    }
    else {
      $element['value']['#description'] = $message;
    }

    $element['#element_validate'][] = [static::class, 'validateElement'];

    return $element;
  }

  /**
   * Validate the VideoTool URL.
   *
   * @param array $element
   *   The form element.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   *
   * @throws \Safe\Exceptions\PcreException
   */
  public static function validateElement(array $element, FormStateInterface $form_state): void {
    if (!self::isValidVideoToolUrl($element['value']['#value'])) {
      $form_state->setError($element, t("The given URL does not match the VideoTool URL pattern."));
    }
  }

  /**
   * {@inheritdoc}
   */
  public static function isApplicable(FieldDefinitionInterface $field_definition): bool {
    return self::targetEntityIsVideoTool($field_definition, parent::isApplicable(...));
  }

}
