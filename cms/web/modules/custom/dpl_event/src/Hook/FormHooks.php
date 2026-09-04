<?php

declare(strict_types=1);

namespace Drupal\dpl_event\Hook;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\dpl_event\Form\SettingsForm;

/**
 * Form alter hooks for dpl_event module.
 */
class FormHooks {

  use StringTranslationTrait;

  /**
   * Constructor.
   */
  public function __construct(
    protected ConfigFactoryInterface $configFactory,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Implements hook_form_alter().
   *
   * - Move the "Published" checkbox to gin sticky action header.
   * - Hide screen names if the feature is disabled.
   * - Correct the description of what a recurrence change does to occurrences.
   *
   * @phpstan-ignore missingType.iterableValue ($form is too complex for typehint)
   */
  #[Hook('form_alter')]
  public function fixSubmitButton(array &$form, FormStateInterface $form_state, string $form_id): void {
    // The exposed form for the event list is rather difficult to detect.
    if ($form_id == 'views_exposed_form' && $form['#id'] == 'views-exposed-form-events-all') {
      $form['actions']['submit']['#type'] = 'image_button';
      $form['actions']['submit']['#src'] = '/themes/custom/novel/assets/dpl-design-system/icons/basic/icon-search.svg';
      // This is horrible, but the Form API apparently already populated the
      // #pre_render, and it's in the pre_render the magic happens.
      $form['actions']['submit']['#pre_render'][0][0] = 'Drupal\Core\Render\Element\ImageButton';

      return;
    }
  }

  /**
   * Implements hook_form_alter().
   *
   * - Move the "Published" checkbox to gin sticky action header.
   * - Hide screen names if the feature is disabled.
   * - Correct the description of what a recurrence change does to occurrences.
   *
   * @phpstan-ignore missingType.iterableValue ($form is too complex for typehint)
   */
  #[Hook('form_eventseries_default_edit_form_alter')]
  #[Hook('form_eventseries_default_add_form_alter')]
  #[Hook('form_eventinstance_default_edit_form_alter')]
  #[Hook('form_eventinstance_default_add_form_alter')]
  public function alterEditForm(array &$form, FormStateInterface $form_state, string $form_id): void {
    // recurring_events warns that every occurrence will be removed and
    // recreated when the recurrence changes. We only touch the occurrences the
    // change actually affects, so say that instead. This override goes away
    // once the creator plugin can supply the message itself. @see
    // \Drupal\dpl_event\Plugin\EventInstanceCreator\DplEventInstanceCreator
    // @see https://www.drupal.org/project/recurring_events/issues/3615282
    if (isset($form['diff']['diff_message'])) {
      $form['diff']['diff_message']['#markup'] = $this->t('The recurrence has been changed. Occurrences that are no longer part of it will be deleted, and any new ones will be created. The remaining occurrences, and anything filled in on them, are left as they are. Deleting an occurrence cannot be undone.', [], ['context' => 'dpl_event']);
    }

    if (isset($form['field_event_all_day'])) {
      $form['field_event_all_day']['warning'] = [
        '#type' => 'container',
        '#attributes' => ['class' => ['dpl-form-warning']],
        '#states' => [
          'visible' => [
            ':input[name="field_event_all_day[value]"]' => ['checked' => TRUE],
          ],
        ],
        'message' => [
          '#markup' => $this->t('Any specific times below will be ignored when "All day" is enabled', [], ['context' => 'dpl_event']),
        ],
      ];
    }

    // PHPCS doesn't understand Drupal's weird way of doing states.
    // phpcs:disable Squiz.Arrays.ArrayDeclaration.NoKeySpecified
    $physical_state = [
      ':input[name="field_event_location_type"]' => ['value' => 'physical'],
      'and',
      [
        [':input[name="field_event_non_branch_location[value]"]' => ['checked' => TRUE]],
      ],
    ];

    if (isset($form['field_event_non_branch_location'])) {
      $form['field_event_non_branch_location']['#states']['visible'] = [
        ':input[name="field_event_location_type"]' => ['value' => 'physical'],
      ];
    }
    // phpcs:enable Squiz.Arrays.ArrayDeclaration.NoKeySpecified

    // We only want to show the field description if it's not an "online" event.
    $form['field_branch']['description'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['form-item__description']],
      '#states' => [
        'invisible' => [
          ':input[name="field_event_location_type"]' => ['value' => 'online'],
        ],
      ],
      'message' => [
        '#markup' => $this->t('When selecting a branch, we will use the address from the branch, unless you select “Other location”.', [], ['context' => 'dpl_event']),
      ],
    ];

    if (isset($form['field_event_location'])) {
      $form['field_event_location']['#states']['visible'] = $physical_state;
      $form['field_event_location']['widget'][0]['value']['#states']['required'] = $physical_state;
    }

    if (isset($form['field_event_address'])) {
      $form['field_event_address']['#states']['visible'] = $physical_state;
    }

    if (isset($form['field_event_address_gsearch'])) {
      $form['field_event_address_gsearch']['#states']['visible'] = $physical_state;
    }

    if (isset($form['field_event_place'])) {
      $form['field_event_place']['#states']['visible'] = [
        ':input[name="field_event_location_type"]' => ['value' => 'physical'],
      ];
    }

    // Make ticket link and capacity dependent on the relevant checkbox.
    if (isset($form['field_event_link'])) {
      $form['field_event_link']['#states']['enabled'] = [
        ':input[name="field_relevant_ticket_manager[value]"]' => ['checked' => FALSE],
      ];
    }

    if (isset($form['field_ticket_capacity'])) {
      $form['field_ticket_capacity']['#states']['enabled'] = [
        ':input[name="field_relevant_ticket_manager[value]"]' => ['checked' => TRUE],
      ];
    }

    // Move the "Published" checkbox to the gin sticky action header.
    if (isset($form['status'])) {
      $form['status']['#group'] = 'status';
    }

    if (!isset($form['field_screen_names'])) {
      return;
    }

    // Undo select2s adding of help text.
    if (isset($form['field_screen_names']['widget']['#description']) &&
        is_array($form['field_screen_names']['widget']['#description']) &&
        is_array($form['field_screen_names']['widget']['#description']['#items'])) {
      $form['field_screen_names']['widget']['#description'] =
        $form['field_screen_names']['widget']['#description']['#items'][0];
    }

    if ($this->configFactory->get(SettingsForm::CONFIG_NAME)->get('enable_screen_name')) {
      return;
    }

    $form['field_screen_names']['#access'] = FALSE;
  }

}
