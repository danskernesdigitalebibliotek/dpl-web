<?php

declare(strict_types=1);

namespace Drupal\dpl_patron_page\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\dpl_patron_page\Form\PatronPageSettingsForm;

/**
 * Hooks for the dpl_protected_nodes module.
 */
class ProtectedNodesHooks {

  /**
   * Protect nodes linked from the patron page settings from deletion.
   *
   * @return mixed[]
   *   Linkit form element information for the settings form.
   */
  #[Hook('dpl_protected_nodes_get_protected_nodes')]
  public function protectSettingsNodes(): array {
    return dpl_protected_nodes_get_context(PatronPageSettingsForm::class, 'dpl_patron_page.settings');
  }

}
