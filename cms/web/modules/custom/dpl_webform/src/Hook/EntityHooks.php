<?php

declare(strict_types=1);

namespace Drupal\dpl_webform\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\webform\WebformInterface;

/**
 * Entity hooks for dpl_webform module.
 */
class EntityHooks {

  /**
   * Set GDPR friendly defaults on new webforms.
   */
  #[Hook('webform_create')]
  public function setWebformDefaults(WebformInterface $webform): void {
    // We want to avoid saving sensitive information from users because of
    // GDPR. Therefore we disable saving of results for all new webforms.
    $webform->setSetting('results_disabled', TRUE);
    $webform->setSetting('results_disabled_ignore', TRUE);

    // We want to set a new "default_value" to the "confirmation_type" setting.
    // If we do not set this, the editors will have to manually change it when
    // creating a new webform.
    $webform->setSetting('confirmation_type', 'message');
  }

}
