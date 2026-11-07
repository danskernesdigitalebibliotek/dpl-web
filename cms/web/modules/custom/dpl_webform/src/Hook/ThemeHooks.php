<?php

declare(strict_types=1);

namespace Drupal\dpl_webform\Hook;

use Drupal\Core\Hook\Attribute\Hook;

/**
 * Theme hooks for dpl_webform module.
 */
class ThemeHooks {

  /**
   * Style webform submit buttons as design system buttons.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_input__submit')]
  public function addSubmitButtonClasses(array &$variables): void {
    $original_classes = $variables['attributes']['class'] ?? [];

    if (in_array('webform-button--submit', $original_classes)) {
      $variables['attributes']['class'] = array_merge($original_classes, [
        'btn-primary',
        'btn-filled',
        'btn-small',
        'arrow__hover--right-small',
        'dpl-button',
      ]);
    }
  }

  /**
   * Add a template suggestion for webform form elements.
   *
   * @param string[] $suggestions
   *   The theme suggestions.
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('theme_suggestions_form_element_alter')]
  public function addWebformElementSuggestion(array &$suggestions, array $variables): void {
    if (isset($variables['element']['#webform_element'])) {
      $suggestions[] = 'form_element__webform';
    }
  }

}
