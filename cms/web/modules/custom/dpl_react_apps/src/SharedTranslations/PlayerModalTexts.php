<?php

namespace Drupal\dpl_react_apps\SharedTranslations;

/**
 * Translations for the digital player modal (audiobooks / podcasts).
 *
 * Shared because the player modal is mounted both on the work page
 * and on the loan list (direct launch from a digital loan).
 */
class PlayerModalTexts {

  /**
   * Get the texts, keyed by their React text-prop key in kebab-case.
   *
   * @return array<string, \Drupal\Core\StringTranslation\TranslatableMarkup>
   *   The texts.
   */
  public static function texts(): array {
    return [
      'player-modal-close-button-text' => t('Close', [], ['context' => 'Player modal']),
      'player-modal-description-text' => t('Modal for player', [], ['context' => 'Player modal']),
    ];
  }

}
