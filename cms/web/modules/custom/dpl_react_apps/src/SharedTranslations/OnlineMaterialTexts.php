<?php

namespace Drupal\dpl_react_apps\SharedTranslations;

/**
 * Translations for the primary "Read" / "Listen" launch actions.
 *
 * Shared because the same labels appear on the work page (the
 * reader/player buttons when a material is already loaned) and on
 * the loan list (the LÆS / LYT button on each digital loan row).
 */
class OnlineMaterialTexts {

  /**
   * Get the texts, keyed by their React text-prop key in kebab-case.
   *
   * @return array<string, \Drupal\Core\StringTranslation\TranslatableMarkup>
   *   The texts.
   */
  public static function texts(): array {
    return [
      'online-material-player-text' => t('Listen to @materialType', [], ['context' => 'Online material']),
      'online-material-reader-text' => t('Read @materialType', [], ['context' => 'Online material']),
    ];
  }

}
