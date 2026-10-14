<?php

declare(strict_types=1);

namespace Drupal\dpl_cookies\Hook;

use Drupal\Core\Hook\Attribute\Hook;

/**
 * Theme hooks for dpl_cookies module.
 */
class ThemeHooks {

  /**
   * Adds cookie consent attributes to media video fields.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_field__media__video')]
  public function addCookieConsentToMediaVideoFields(array &$variables): void {
    foreach ($variables['items'] as &$item) {
      if (isset($item['content']['#attributes']['src'])) {
        $item['content']['#attributes']['data-once'] = 'cookieinformation-iframe';
        $item['content']['#attributes']['data-category-consent'] = 'cookie_cat_marketing';
        $item['content']['#attributes']['data-consent-src'] = $item['content']['#attributes']['src'];
        $item['content']['#attributes']['src'] = '';
      }
    }
  }

}
