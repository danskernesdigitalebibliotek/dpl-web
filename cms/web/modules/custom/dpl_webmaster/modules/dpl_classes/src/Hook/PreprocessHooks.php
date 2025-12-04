<?php

declare(strict_types=1);

namespace Drupal\dpl_classes\Hook;

use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Hook\Attribute\Hook;

/**
 * Theme preprocess hooks.
 */
class PreprocessHooks {

  /**
   * Node preprocess function.
   *
   * @param array<string|int, mixed> &$variables
   *   Theme variables.
   */
  #[Hook('preprocess_node')]
  public function preprocessNode(array &$variables): void {
    $this->applyClassesToVariables($variables['node'], $variables);
  }

  /**
   * Field preprocess function.
   *
   * Paragraph theming vary a lot and in some cases doesn't have a suitable
   * wrapper to apply classes to, so apply the classes to the field_paragraph
   * items instead.
   *
   * @param array<string|int, mixed> &$variables
   *   Theme variables.
   */
  #[Hook('preprocess_field')]
  public function preprocessField(array &$variables): void {
    if ($variables['field_name'] == 'field_paragraphs') {
      foreach ($variables['items'] as &$item) {
        $this->applyClassesToVariables($item['content']['#paragraph'], $item);
      }
    }
  }

  /**
   * Apply entity CSS classes to theme variables.
   *
   * @param \Drupal\Core\Entity\ContentEntityBase $entity
   *   Entity to apply classes for.
   * @param array<string|int, mixed> &$variables
   *   Theme variables.
   */
  protected function applyClassesToVariables(ContentEntityBase $entity, array &$variables): void {
    $classes = $entity->get('dpl_classes')->value;

    $variables['attributes']['class'][] = $classes;
  }

}
