<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\Core\Field\EntityReferenceFieldItemList;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Bundle class for nav_spots_manual paragraphs.
 */
class NavSpotsManualParagraph extends Paragraph {

  /**
   * Get the UUIDs of the linked pages.
   *
   * @return string[]
   *   The UUIDs.
   */
  public function getLinkedPageUuids(): array {
    $field = $this->get('field_nav_spots_content');
    if (!$field instanceof EntityReferenceFieldItemList) {
      return [];
    }

    $uuids = [];
    foreach ($field->referencedEntities() as $entity) {
      $uuids[] = (string) $entity->uuid();
    }

    return $uuids;
  }

}
