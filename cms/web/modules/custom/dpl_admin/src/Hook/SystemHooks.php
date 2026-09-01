<?php

declare(strict_types=1);

namespace Drupal\dpl_admin\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\system\Form\SiteInformationForm;

/**
 * System and module hooks for dpl_admin module.
 */
class SystemHooks {

  /**
   * Implements hook_element_info_alter().
   *
   * @phpstan-ignore missingType.iterableValue ($types is a complex array)
   */
  #[Hook('element_info_alter')]
  public function elementInfoAlter(array &$types): void {
    $types['datetime']['#process'][] = [self::class, 'datetimeSetFormat'];
  }

  /**
   * Element process callback for datetime fields.
   *
   * @param array<mixed> $element
   *   The form element that we are overriding.
   *
   * @return array<mixed>
   *   Updated version of $element.
   */
  public static function datetimeSetFormat(array $element): array {
    // Remove seconds in browsers that support HTML5 type=date.
    $element['time']['#attributes']['step'] = 60;
    return $element;
  }

  /**
   * Implements hook_dpl_protected_nodes_get_protected_nodes().
   *
   * @todo doesn't belong in this file.
   *
   * @return mixed[]
   *   An array containing linkit form element information.
   */
  #[Hook('dpl_protected_nodes_get_protected_nodes')]
  public function dplProtectedNodesGetProtectedNodes(): array {
    return dpl_protected_nodes_get_context(SiteInformationForm::class, 'system.site_information_settings');
  }

}
