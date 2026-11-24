<?php

declare(strict_types=1);

namespace Drupal\dpl_fees\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\dpl_fees\Form\FeesListSettingsForm;

/**
 * Hooks for the dpl_protected_nodes module.
 */
class ProtectedNodesHooks {

  /**
   * Protect nodes linked from the fees list settings from deletion.
   *
   * @return mixed[]
   *   Linkit form element information for the settings form.
   */
  #[Hook('dpl_protected_nodes_get_protected_nodes')]
  public function protectSettingsNodes(): array {
    return dpl_protected_nodes_get_context(FeesListSettingsForm::class, 'dpl_fees.settings');
  }

}
