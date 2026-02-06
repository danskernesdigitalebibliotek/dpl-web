<?php

declare(strict_types=1);

namespace Drupal\bnf_client;

use Drupal\bnf\BnfStateEnum;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Queue\QueueFactory;

/**
 * Handles queueing of updates to subscriptions and content.
 */
class BnfScheduler {

  /**
   * Constructor.
   */
  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected QueueFactory $queueFactory,
  ) {}

  /**
   * Queue an update check on all subscriptions.
   */
  public function queueAllSubscriptionsUpdate(): void {
    /** @var \Drupal\bnf_client\Entity\Subscription[] $subscriptions */
    $subscriptions = $this->entityTypeManager->getStorage('bnf_subscription')->loadMultiple();

    $queue = $this->queueFactory->get('bnf_client_new_content');

    foreach ($subscriptions as $subscription) {
      $queue->createItem(['id' => $subscription->id()]);
    }
  }

  /**
   * Queue an update check on all nodes.
   */
  public function queueAllNodesUpdate(): void {
    $query = $this->entityTypeManager->getStorage('node')->getQuery();

    $query->condition(BnfStateEnum::FIELD_NAME, BnfStateEnum::Imported->value);

    $nids = $query->accessCheck(FALSE)->execute();
    /** @var \Drupal\node\Entity\Node[] $nodes */
    $nodes = $this->entityTypeManager->getStorage('node')->loadMultiple(array_values($nids));

    $queue = $this->queueFactory->get('bnf_client_node_update');

    foreach ($nodes as $node) {
      $queue->createItem(['uuid' => $node->uuid()]);
    }
  }

}
