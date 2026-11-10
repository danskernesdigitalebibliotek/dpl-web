<?php

declare(strict_types=1);

namespace Drupal\dpl_po\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\field\Entity\FieldConfig;

/**
 * Entity hooks.
 */
class EntityHooks {

  /**
   * Convert line breaks in field descriptions to br tags.
   *
   * Makes sure that exported configuration descriptions are displayed with
   * br tags as line breaks.
   */
  #[Hook('entity_field_config_presave')]
  public function convertFieldDescriptionLineBreaks(FieldConfig $entity): void {
    $description = $entity->getDescription();
    $updated_description = str_replace(["\r\n", "\r", "\n"], "<br />", (string) $description);
    $entity->setDescription($updated_description);
  }

}
