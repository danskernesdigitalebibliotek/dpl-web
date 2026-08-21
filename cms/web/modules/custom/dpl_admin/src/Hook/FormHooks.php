<?php

declare(strict_types=1);

namespace Drupal\dpl_admin\Hook;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Hook\Order\OrderAfter;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\Core\Url;
use Drupal\recurring_events\Entity\EventInstance;
use Drupal\recurring_events\Entity\EventSeries;

/**
 * Form alter hooks for dpl_admin module.
 */
class FormHooks {

  use StringTranslationTrait;

  /**
   * Constructor.
   */
  public function __construct(
    protected MessengerInterface $messenger,
    protected RouteMatchInterface $routeMatch,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Misc form altering.
   *
   * @todo After upgrading to D11, eliminate this and use `hook_FORM_ID_alter`
   * attributes on the other methods.
   *
   * This uses `OrderAfter` to mimic the existing `module_implements_alter`,
   * but the user form is the only one needing it.
   *
   * @phpstan-ignore missingType.iterableValue ($form is to complex for
   * typehint), class.notFound (Order attribute comes in D11)
   */
  #[Hook('form_alter', order: new OrderAfter(['password_policy']))]
  public function formAlter(array &$form, FormStateInterface $form_state, string $form_id): void {
    if (in_array($form_id, ['eventseries_default_add_form', 'eventseries_default_edit_form', 'eventseries_default_form'])) {
      $this->alterEventseries($form, $form_state);
    }

    if (in_array($form_id, [
      'eventinstance_default_add_form',
      'eventinstance_default_edit_form',
      'eventinstance_default_form',
    ])) {
      $this->alterEventinstance($form, $form_state);
    }

    if (in_array($form_id, ['node_page_form', 'node_page_edit_form'])) {
      $this->alterNodePage($form, $form_state);
    }

    if (in_array($form_id, ['user_register_form', 'user_form'])) {
      $this->alterUserForm($form, $form_state);
    }
  }

  /**
   * Add attributes and title to password reset form.
   *
   * @phpstan-ignore missingType.iterableValue ($form is to complex for
   * typehint)
   */
  public function formUserPassResetAlter(array &$form, FormStateInterface $form_state, string $form_id): void {
    $form['#attributes']['class'][] = 'rich-text';
    $form['#attributes']['class'][] = 'dpl-form';
    $form['title'] = [
      '#type' => 'markup',
      '#prefix' => '<h1>',
      '#suffix' => '</h1>',
      '#markup' => $this->t('Reset password', [], ['context' => 'DPL admin']),
      '#weight' => '-999',
    ];

    $form['actions']['submit']['#attributes']['class'] = ['btn-primary', 'btn-filled btn-small', 'dpl-button'];
  }

  /**
   * Add cancel button to recurring_event custom confirm form.
   *
   * When saving a series, and changing the dates, the recurring_events module
   * will make a "custom" submit button, showing a 'are you sure' button.
   * However, this does not include a 'cancel' button. This is because cancel
   * basically just means navigating away, but, this is confusing for editors.
   * We'll add our own "button", that is really just a link the same edit page.
   *
   * @phpstan-ignore missingType.iterableValue ($form is to complex for typehint)
   */
  #[Hook('form_eventseries_default_edit_form_alter')]
  public function formEventseriesDefaultEditFormAlter(array &$form, FormStateInterface $form_state): void {
    if (!empty($form['diff']['confirm'])) {
      $form['#attributes']['class'][] = 'eventseries-form--confirm';

      $form['diff']['cancel'] = [
        '#type' => 'link',
        '#title' => $this->t('Cancel all changes', [], ['context' => 'DPL admin UX']),
        '#url' => Url::fromRoute('<current>'),
        '#attributes' => [
          'class' => [
            'action-link', 'action-link--danger', 'action-link--icon-trash',
          ],
        ],
      ];
    }
  }

  /**
   * Helper form alter callback for altering the event series form.
   *
   * Wraps certain form elements within a flex container to apply styling.
   *
   * @param array<mixed> $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   */
  protected function alterEventseries(array &$form, FormStateInterface $form_state): void {
    $keys = ['weekly_recurring_date', 'monthly_recurring_date', 'yearly_recurring_date', 'daily_recurring_date'];

    // Set the reccurance type to 'custom' by default, if nothing else is set.
    if (isset($form['recur_type']['widget']['#default_value']) && empty($form['recur_type']['widget']['#default_value'])) {
      $form['recur_type']['widget']['#default_value'] = 'custom';
    }

    foreach ($keys as $key) {
      $form_element_date_start = $form[$key]['widget'][0]['value'] ?? NULL;
      $form_element_date_end = $form[$key]['widget'][0]['end_value'] ?? NULL;

      // Wrapping the "between these dates" fields with a flex wrapper.
      if (!empty($form_element_date_start) && !empty($form_element_date_end)) {
        $form_element_date_start['#prefix'] = '<div class="dpl-admin__flex-container">';
        $form_element_date_end['#suffix'] = '</div>';

        $form[$key]['widget'][0]['value'] = $form_element_date_start;
        $form[$key]['widget'][0]['end_value'] = $form_element_date_end;
      }

      $form_element_time_start = $form[$key]['widget'][0]['time'] ?? NULL;
      $form_element_time_end = $form[$key]['widget'][0]['duration'] ?? NULL;

      // Wrapping the "start date" fields with a flex wrapper.
      if (!empty($form_element_time_start) && !empty($form_element_time_end)) {
        $form_element_time_start['#prefix'] = '<div class="dpl-admin__flex-container">';
        $form_element_time_end['#suffix'] = '</div>';

        $form[$key]['widget'][0]['time'] = $form_element_time_start;
        $form[$key]['widget'][0]['duration'] = $form_element_time_end;
      }
    }
  }

  /**
   * Helper form alter callback for the event instance form.
   *
   * Adds warning messages to the form that the user is editing a single event
   * in an event series, and provides a link to edit the series.
   *
   * @param array<mixed> $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   */
  protected function alterEventinstance(array &$form, FormStateInterface $form_state): void {
    $event_instance = $this->routeMatch->getParameter('eventinstance');
    $message_suffix = '';

    if ($event_instance instanceof EventInstance) {
      $event_series = $event_instance->getEventSeries();

      // Without a series there is nothing to link to, and the warning goes out
      // without the link.
      if ($event_series instanceof EventSeries) {
        $event_series_edit_url = Url::fromRoute(
          'entity.eventseries.edit_form',
          ['eventseries' => $event_series->id()]
        )->toString();

        $message_suffix =
          $this->t('<a href="@url">Edit the series here</a>',
            ['@url' => $event_series_edit_url],
            ['context' => 'DPL admin UX']
          );
      }
    }

    $this->messenger->addWarning($this->t(
      'You are currently editing a single event, in an event series. @suffix',
      ['@suffix' => $message_suffix],
      ['context' => 'DPL admin UX']
    ));
    $this->messenger->addWarning($this->t(
      'Any changes you make here will only override this single event.',
      [], ['context' => 'DPL admin UX']
    ));
    $this->messenger->addWarning($this->t('If you leave fields empty, the data from the parent series will be used.',
      [], ['context' => 'DPL admin UX']
    ));
  }

  /**
   * Helper form alter callback for the page node CT edit/add form.
   *
   * Hides hero fields, if display_titles is not toggled on.
   *
   * @param array<mixed> $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   */
  protected function alterNodePage(array &$form, FormStateInterface $form_state): void {
    // Hide title fields, if the editor choose to disable it.
    if (!empty($form['field_display_titles'])) {
      $inactive_state = [':input[name="field_display_titles[value]"]' => ['checked' => FALSE]];

      $form['field_hero_title']['#states']['invisible'] = $inactive_state;
      $form['field_subtitle']['#states']['invisible'] = $inactive_state;
    }
  }

  /**
   * Helper form alter callback for the user add/edit form.
   *
   * Re-ordering the user edit form, to make the password demands clearer.
   *
   * @param array<mixed> $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   */
  protected function alterUserForm(array &$form, FormStateInterface $form_state): void {
    // We're setting the numbers high, to make sure they show up last, in this
    // order.
    $form['account']['current_pass']['#weight'] = 997;
    $form['account']['pass']['#weight'] = 998;
    $form['account']['password_policy_status']['#weight'] = 999;
  }

}
