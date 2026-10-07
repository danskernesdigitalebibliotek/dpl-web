<?php

namespace Drupal\dpl_react_apps\SharedTranslations;

/**
 * Translations for a digital session the WeDoBooks SDK ended on its own.
 *
 * A patron reads or listens in one place at a time, so opening a loan
 * elsewhere closes the reader or player here, a loan that expires while open
 * is closed too, and a patron with no room for another device cannot open one
 * at all. Shared because both the reader page and the player page have to
 * explain that.
 */
class DigitalSessionTexts {

  /**
   * Get the texts, keyed by their React text-prop key in kebab-case.
   *
   * @return array<string, \Drupal\Core\StringTranslation\TranslatableMarkup>
   *   The texts.
   */
  public static function texts(): array {
    return [
      'digital-session-taken-over-device-text' => t('You opened this title on another device. You can read or listen on one device at a time.', [], ['context' => 'Digital session']),
      'digital-session-taken-over-tab-text' => t('You opened this title in another tab of this browser.', [], ['context' => 'Digital session']),
      'digital-session-device-revoked-text' => t('This device is no longer registered to your account.', [], ['context' => 'Digital session']),
      'digital-session-access-expired-text' => t('Your loan of this title has expired, so it was closed.', [], ['context' => 'Digital session']),
      'digital-session-device-limit-text' => t('You can read and listen on up to @limit devices, and they are all in use. Remove one to continue here.', [], ['context' => 'Digital session']),
      'digital-session-device-last-used-text' => t('Last used @date', [], ['context' => 'Digital session']),
      'digital-session-remove-device-button-text' => t('Remove', [], ['context' => 'Digital session']),
      'digital-session-open-failed-text' => t('The title could not be opened. Try again later.', [], ['context' => 'Digital session']),
      'digital-session-open-again-button-text' => t('Open again', [], ['context' => 'Digital session']),
      'digital-session-interrupted-close-button-text' => t('Back', [], ['context' => 'Digital session']),
    ];
  }

}
