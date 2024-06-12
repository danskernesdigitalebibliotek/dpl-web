<?php

/**
 * @file
 * Fix this.
 *
 * @todo Fix this todo.
 *
 * This does not run with task dev:reset.
 * It only works if I change the hook name and execute dec drush deploy:hook.
 */

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\node\Entity\Node;

/**
 * Implements hook_deploy().
 *
 * Deploy hook to set publication date for all existing nodes of
 *  type "article" And "page".
 */
function dpl_publication_deploy_default_publication_date(): void {
  $nids = Drupal::entityQuery('node')
    ->condition('type', ['article', 'page'], 'IN')
    ->accessCheck(TRUE)
    ->execute();

  // Load each node and update the publication date.
  foreach ($nids as $nid) {
    $node = Node::load($nid);

    // Check if the node is published and does not have a publication date set.
    if ($node && $node->isPublished() && !$node->get('field_publication_date')
      ->getValue()) {
      // Get the creation time.
      $creation_time = $node->getCreatedTime();

      // Convert the creation time to the 'Y-m-d' format.
      $creation_date = DrupalDateTime::createFromTimestamp($creation_time)
        ->format('Y-m-d');

      // Set the field_publication_date to the creation date.
      $node->set('field_publication_date', $creation_date);
      $node->save();
    }
  }
}
