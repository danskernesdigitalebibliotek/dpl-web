<?php

declare(strict_types=1);

namespace Drupal\dpl_article\Hook;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;

/**
 * Form hooks for dpl_article module.
 */
class FormHooks {

  /**
   * Modifies node forms to control the visibility of author fields.
   *
   * @param array<mixed> $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   * @param string $form_id
   *   The unique identifier of the form.
   */
  #[Hook('form_alter')]
  public function toggleOverrideAuthorFieldVisibility(array &$form, FormStateInterface $form_state, string $form_id): void {
    // Target only article and go_article node creation or edit forms.
    if (!str_starts_with($form_id, 'node_article_') && !str_starts_with($form_id, 'node_go_article_')) {
      return;
    }

    // Toggle visibility of 'override author' field based on a checkbox.
    if (isset($form['field_show_override_author'])) {
      $form['field_override_author']['#states'] = [
        'visible' => [':input[name="field_show_override_author[value]"]' => ['checked' => TRUE]],
      ];
    }
  }

}
