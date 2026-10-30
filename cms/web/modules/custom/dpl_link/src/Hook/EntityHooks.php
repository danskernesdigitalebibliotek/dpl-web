<?php

declare(strict_types=1);

namespace Drupal\dpl_link\Hook;

use Drupal\Core\Entity\Query\QueryInterface;
use Drupal\Core\Hook\Attribute\Hook;

/**
 * Entity hooks.
 */
class EntityHooks {

  /**
   * Hide campaign nodes from Linkit autocomplete.
   *
   * Campaigns are not meant to be linked to as standalone pages. Negating the
   * bundle (rather than using Linkit's allow-list "bundles" setting) keeps any
   * new content types automatically visible without needing config updates.
   */
  #[Hook('entity_query_tag__linkit_entity_node_autocomplete_alter')]
  public function hideCampaignsFromLinkit(QueryInterface $query): void {
    $query->condition('type', 'campaign', '<>');
  }

}
