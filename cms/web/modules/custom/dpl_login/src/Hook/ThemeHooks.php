<?php

declare(strict_types=1);

namespace Drupal\dpl_login\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;

/**
 * Theme hooks for dpl_login module.
 */
class ThemeHooks {

  use StringTranslationTrait;

  public function __construct(
    protected AccountInterface $currentUser,
    TranslationInterface $stringTranslation,
  ) {
    $this->setStringTranslation($stringTranslation);
  }

  /**
   * Add "Logged in" to the page title of logged in users.
   *
   * @param array<mixed> $variables
   *   The variables array.
   */
  #[Hook('preprocess_html')]
  public function addLoggedInToTitle(array &$variables): void {
    if ($this->currentUser->isAuthenticated()) {
      $variables['head_title'][] = $this->t('Logged in', [], ['context' => 'dpl_login']);
    }
  }

}
