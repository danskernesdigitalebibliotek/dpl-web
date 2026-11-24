<?php

declare(strict_types=1);

namespace Drupal\dpl_library_agency\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\dpl_library_agency\Form\GeneralSettingsForm;

/**
 * Hooks for the dpl_protected_nodes module.
 */
class ProtectedNodesHooks {

  /**
   * Protect nodes linked from the general settings from deletion.
   *
   * @return mixed[]
   *   Linkit form element information for the settings form.
   */
  #[Hook('dpl_protected_nodes_get_protected_nodes')]
  public function protectSettingsNodes(): array {
    return dpl_protected_nodes_get_context(GeneralSettingsForm::class, 'dpl_library_agency.general_settings');
  }

}
