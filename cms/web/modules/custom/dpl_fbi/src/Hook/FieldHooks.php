<?php

declare(strict_types=1);

namespace Drupal\dpl_fbi\Hook;

use Drupal\Core\Hook\Attribute\Hook;

/**
 * Field hooks for dpl_fbi module.
 */
class FieldHooks {

  /**
   * Add remove buttons to multi-value work ID fields.
   *
   * @param string[] $fieldTypes
   *   Field types that get a remove button.
   */
  #[Hook('multiple_field_remove_button_field_types_alter')]
  public function addWorkIdRemoveButton(array &$fieldTypes): void {
    $fieldTypes[] = "dpl_fbi_work_id";
  }

}
