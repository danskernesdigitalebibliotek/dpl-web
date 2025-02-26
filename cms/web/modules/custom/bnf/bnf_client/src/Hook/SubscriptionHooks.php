<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Hook;

use Drupal\bnf_client\Entity\Subscription;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Queue\QueueFactory;
use Webmozart\Assert\Assert;

/**
 * Subscription hooks.
 */
class SubscriptionHooks {

  /**
   * Constructor.
   */
  public function __construct(protected QueueFactory $queueManager) {}

  /**
   * Queue new content check on subscription creation and update.
   */
  #[Hook('bnf_subscription_insert')]
  #[Hook('bnf_subscription_update')]
  public function queueUpdate(EntityInterface $entity): void {
    /** @var \Drupal\bnf_client\Entity\Subscription $entity */
    Assert::isInstanceOf($entity, Subscription::class);

    if (!$entity->noCheck) {
      $this->queueManager->get('bnf_client_new_content')->createItem(['uuid' => $entity->id()]);
    }
  }

}
