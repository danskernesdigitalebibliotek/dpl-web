<?php

declare(strict_types=1);

namespace Drupal\dpl_publication\Hook;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\node\NodeInterface;

/**
 * Entity hooks.
 */
class EntityHooks {

  /**
   * Set the publication date when a node is published.
   *
   * Sets field_publication_date to the current date if the node is being
   * published, or if the publication date is not already set.
   *
   * In general, nodes shouldn't lack a publication date as the field is
   * required and defaults to today, but as some nodes could predate this
   * module, we have that extra check.
   */
  #[Hook('node_presave')]
  public function setPublicationDate(NodeInterface $node): void {
    if (!$node->hasField('field_publication_date')) {
      return;
    }

    $original_node = $node->getOriginal() ?? NULL;

    if (!($original_node instanceof NodeInterface)) {
      return;
    }

    // Only update the publication date, if nothing is set, or if the status is
    // moved to 'published'.
    if ($node->get('field_publication_date')->isEmpty() ||
      ($node->isPublished() && !$original_node->isPublished())) {
      $current_date = new DrupalDateTime('now');
      $formatted_date = $current_date->format('Y-m-d');
      $node->set('field_publication_date', $formatted_date);
    }
  }

}
