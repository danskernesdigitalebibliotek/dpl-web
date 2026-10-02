<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Hook;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\bnf\BnfStateEnum;
use Drupal\bnf\Services\BnfImporter;
use Drupal\bnf_client\Entity\Subscription;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Queue\QueueFactory;
use Webmozart\Assert\Assert;

/**
 * Subscription hooks.
 */
class SubscriptionHooks {

  use AutowirePluginTrait;

  /**
   * Constructor.
   */
  public function __construct(protected QueueFactory $queueManager, protected EntityTypeManagerInterface $entityTypeManager) {}

  /**
   * Queue new content check on subscription creation and update.
   */
  #[Hook('bnf_subscription_insert')]
  #[Hook('bnf_subscription_update')]
  public function queueUpdate(EntityInterface $entity): void {
    Assert::isInstanceOf($entity, Subscription::class);

    if (!$entity->noCheck) {
      $this->queueManager->get('bnf_client_new_content')->createItem([
        'id' => $entity->id(),
        'categories' => $entity->getCategories(),
        'tags' => $entity->getTags(),
      ]);
    }
  }

  /**
   * What to do when a subscription is deleted.
   */
  #[Hook('bnf_subscription_delete')]
  public function subscriptionDelete(EntityInterface $entity): void {
    Assert::isInstanceOf($entity, Subscription::class);

    $field_key = 'bnf_source_subscriptions';

    // Finding all nodes that have been imported as part of this subscription.
    $nodeStorage = $this->entityTypeManager->getStorage('node');
    $query = $nodeStorage->getQuery();
    $nids =
      $query
        ->condition($field_key, [$entity->id()], 'IN')
        ->accessCheck(FALSE)
        ->execute();

    /** @var \Drupal\node\NodeInterface[] $nodes */
    $nodes = $nodeStorage->loadMultiple($nids);

    foreach ($nodes as $node) {
      $subscriptionIds = $node->get($field_key)->getValue();

      $subscriptionIds = array_unique(array_column($subscriptionIds, 'target_id'));

      // Removing any references to the deleted subscription.
      $subscriptionIds = array_diff($subscriptionIds, [$entity->id()]);
      $node->set($field_key, $subscriptionIds);

      $stillInSubscription = !empty($subscriptionIds);
      $claimedAndPublished = BnfImporter::isLocallyClaimed($node) && $node->isPublished();
      if ($stillInSubscription || $claimedAndPublished) {
        $node->save();
        continue;
      }

      if ($entity->pruneContent) {
        $node->delete();
        continue;
      }

      $node->set(BnfStateEnum::FIELD_NAME, BnfStateEnum::LocallyClaimed);
      $node->save();
    }
  }

}
