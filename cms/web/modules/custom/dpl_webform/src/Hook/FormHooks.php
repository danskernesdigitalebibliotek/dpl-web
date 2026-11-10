<?php

declare(strict_types=1);

namespace Drupal\dpl_webform\Hook;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\webform\WebformInterface;

/**
 * Form hooks for dpl_webform module.
 */
class FormHooks {

  public function __construct(
    protected AccountInterface $currentUser,
    protected RouteMatchInterface $routeMatch,
  ) {}

  /**
   * Restrict access to advanced general webform settings.
   *
   * @param array<mixed> $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   * @param string $form_id
   *   The form ID.
   */
  #[Hook('form_webform_settings_form_alter')]
  public function restrictGeneralSettings(array &$form, FormStateInterface $form_state, string $form_id): void {
    $access = $this->currentUser->hasPermission('administer advanced webform general settings');

    // We restrict access to the following settings:
    $form['general_settings']['archive']['#access'] = $access;
    $form['general_settings']['results_disabled']['#access'] = $access;
    $form['general_settings']['results_disabled_error']['#access'] = $access;
    $form['general_settings']['results_disabled_ignore']['#access'] = $access;
    $form['general_settings']['categories']['#access'] = $access;
    $form['page_settings']['#access'] = $access;
    $form['ajax_settings']['#access'] = $access;
    $form['third_party_settings']['#access'] = $access;
  }

  /**
   * Restrict access to advanced webform confirmation settings.
   *
   * @param array<mixed> $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   * @param string $form_id
   *   The form ID.
   */
  #[Hook('form_webform_settings_confirmation_form_alter')]
  public function restrictConfirmationSettings(array &$form, FormStateInterface $form_state, string $form_id): void {
    $access = $this->currentUser->hasPermission('administer advanced webform confirmation settings');

    // We restrict access to the following settings:
    $form['confirmation_type']['#access'] = $access;
    $form['confirmation_url']['#access'] = $access;
    $form['confirmation_settings']['confirmation_title']['#access'] = $access;
    $form['confirmation_attributes_container']['#access'] = $access;
    $form['back']['#access'] = $access;
  }

  /**
   * Restrict access to advanced webform element settings.
   *
   * @param array<mixed> $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   * @param string $form_id
   *   The form ID.
   */
  #[Hook('form_webform_ui_element_form_alter')]
  public function restrictElementSettings(array &$form, FormStateInterface $form_state, string $form_id): void {
    $access = $this->currentUser->hasPermission('administer advanced webform element settings');

    // We restrict access to the following settings:
    $form['properties']['conditional_logic']['#access'] = $access;
    $form['properties']['display']['#access'] = $access;
    $form['properties']['admin']['#access'] = $access;
    $form['properties']['access']['#access'] = $access;
    $form['properties']['multiple']['#access'] = $access;
    $form['properties']['default']['#access'] = $access;
    $form['properties']['wrapper_attributes']['#access'] = $access;
    $form['properties']['element_attributes']['#access'] = $access;
    $form['properties']['label_attributes']['#access'] = $access;
  }

  /**
   * Hide and preset the sender of webform handlers.
   *
   * @param array<mixed> $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   * @param string $form_id
   *   The form ID.
   */
  #[Hook('form_webform_handler_form_alter')]
  public function presetHandlerSender(array &$form, FormStateInterface $form_state, string $form_id): void {
    // We remove access to 'from' settings and set default values
    // that matches what Azure Communication Services (ACS) expects.
    $form['settings']['from']['#access'] = FALSE;
    $form['settings']['from']['from_mail']['from_mail']['#default_value'] = '[site:mail]';
    $form['settings']['from']['from_name']['from_name']['#default_value'] = '';
  }

  /**
   * Avoid the translation warning when editing webforms.
   *
   * @param array<mixed> $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   * @param string $form_id
   *   The form ID.
   */
  #[Hook('form_webform_edit_form_alter')]
  public function suppressTranslationWarning(array &$form, FormStateInterface $form_state, string $form_id): void {
    $webform = $this->routeMatch->getParameter('webform');

    if (!$webform instanceof WebformInterface) {
      return;
    }

    // Editors with their default language set to danish, kept getting
    // a warning message when editting webforms. The warning said that
    // they were editting the original english version of the webform.
    // We do not care about the warning, since that is the expected
    // behaviour. To avoid showing the warning, we simply set the
    // langcode to danish on the webform edit forms.
    $webform->set('langcode', 'da');
  }

}
