<?php

declare(strict_types=1);

namespace Drupal\dpl_fbi\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Defines the 'dpl_fbi_work_id_with_type' field widget.
 *
 * @FieldWidget(
 *   id = "dpl_fbi_work_id_with_type",
 *   label = @Translation("Work id with type"),
 *   field_types = {"dpl_fbi_work_id"},
 * )
 */
final class WorkIdWithTypeWidget extends WidgetBase {

  /**
   * {@inheritdoc}
   */
  public function formElement(
        FieldItemListInterface $items,
        $delta,
        array $element,
        array &$form,
        FormStateInterface $form_state
    ): array {
    // Work ID text field.
    $element['value'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Work ID'),
      '#default_value' => $items[$delta]->value ?? NULL,
      '#description' => $this->t('This is the work ID used to retrieve the material information. Example: work-of:870970-basis:136336282.
      Currently this is retrieved by performing a search for a material manually, and copying this value from the URL.
      If you need to link to a specific type, select it from the dropdown and the system will display that, if it is available.
'),
    ];

    // All of these options are derived from the 'display' material types
    // available from FBI. The list is not exhaustive. If you change any of
    // these, remember that they are appended to some URL constructions for
    // paragraphs. A value, such as 'Musik (online)' must be equivalent to the
    // value of an availability label displayed in React. All strings are
    // intentionally not translatable. They are already in Danish and wouldn't
    // be translated anyway, and this keeps the code simpler.
    $element['material_type'] = [
      '#type' => 'select',
      '#title' => $this->t('Material Type'),
      '#default_value' => $items[$delta]->material_type ?? '',
      '#options' => [
        // phpcs:disable DrupalPractice.General.OptionsT.TforValue
        '' => '- None -',
        'bog' => 'Bog',
        'billedbog' => 'Billedbog',
        'billedbog (online)' => 'Billedbog (online)',
        'e-bog' => 'E-bog',
        'cd' => 'CD',
        'podcast' => 'Podcast',
        'musik (online)' => 'Musik (online)',
        'film' => 'Film',
        'film (online)' => 'Film (online)',
        'lydbog' => 'Lydbog',
        'lydbog (online)' => 'Lydbog (online)',
        'lydbog (cd-mp3)' => 'Lydbog (CD-MP3)',
        'artikel' => 'Artikel',
        'artikel (online)' => 'Artikel (online)',
        'tegneserie' => 'Tegneserie',
        'tegneserie (online)' => 'Tegneserie (online)',
        'tidsskrift' => 'Tidsskrift',
        'tidsskrift (online)' => 'Tidsskrift (online)',
      ],
      '#description' => $this->t('Select the material type.'),
      // phpcs:enable DrupalPractice.General.OptionsT.TforValue
    ];

    return $element;
  }

}
