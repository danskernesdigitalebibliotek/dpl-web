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

/**
 * Update field_publication_date on nodes that does not have data.
 *
 * We previously forgot to do this to unpublished nodes. This will add the
 * publication date to any nodes that does not already have data, either
 * programmatically or manually created.
 */
function dpl_publication_deploy_default_publication_dates_again(): string {
  $nids = Drupal::entityQuery('node')
    ->condition('type', ['article', 'page'], 'IN')
    ->notExists('field_publication_date')
    ->accessCheck(FALSE)
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
