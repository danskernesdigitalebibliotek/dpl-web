<?php

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\node\Entity\Node;

/**
 * Implements hook_deploy().
 *
 * Deploy hook to set publication date for all existing nodes of
 * type "article" and "page".
 */
function dpl_publication_deploy_default_publication_date(): string {
  $nids = Drupal::entityQuery('node')
    ->condition('type', ['article', 'page'], 'IN')
    ->condition('status', 1)
    ->notExists('field_publication_date')
    ->accessCheck(TRUE)
    ->execute();

  if (empty($nids)) {
    return 'No nodes found to update.';
  }

  $nodes = Node::loadMultiple($nids);

  $node_labels = [];
  foreach ($nodes as $node) {
    $creation_time = $node->getCreatedTime();

    $creation_date = DrupalDateTime::createFromTimestamp($creation_time)
      ->format('Y-m-d');

    $node->set('field_publication_date', $creation_date);
    $node->save();

    $node_labels[] = $node->label();
  }

  return 'Updated nodes: ' . implode(', ', $node_labels);
}
