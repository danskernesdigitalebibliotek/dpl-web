<?php

declare(strict_types=1);

namespace Drupal\bnf_client;

use Drupal\bnf_client\Entity\Subscription;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\taxonomy\Entity\Term;

/**
 * Helpers for interacting with subscriptions.
 */
class SubscriptionHelper {

  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected BnfScheduler $scheduler,
  ) {}

  /**
   * Ensure subscription with term exists.
   *
   * Will create subscription and tag as needed. If subscription already exist
   * no changes will be made.
   *
   * @param string $subscriptionUuid
   *   The UUID of the subscription to add.
   * @param string $label
   *   The label for the subscription.
   * @param string|null $tagName
   *   Optional tag name to create and associate with the subscription.
   *   If provided, a taxonomy term will be created in the 'tags' vocabulary
   *   and the subscription will be configured to automatically tag all
   *   imported content with this term.
   *
   * @return bool
   *   Whether subscription was created.
   */
  public function ensureWithTag(
    string $subscriptionUuid,
    string $label,
    ?string $tagName = NULL,
  ): bool {
    if ($this->getBySubscriptionUuid($subscriptionUuid)) {
      return FALSE;
    }

    // Create the subscription.
    $subscriptionData = [
      'subscription_uuid' => $subscriptionUuid,
      'label' => $label,
    ];

    // Create and associate taxonomy term if tag name is provided.
    if ($tagName) {
      $termStorage = $this->entityTypeManager->getStorage('taxonomy_term');

      // Check if tag already exists.
      $existingTerms = $termStorage->loadByProperties([
        'name' => $tagName,
        'vid' => 'tags',
      ]);

      if ($existingTerms) {
        $tagTerm = reset($existingTerms);
      }
      else {
        // Create new taxonomy term.
        $tagTerm = Term::create([
          'name' => $tagName,
          'vid' => 'tags',
        ]);
        $tagTerm->save();
      }

      // Add the tag to the subscription data.
      $subscriptionData['tags'] = [['target_id' => $tagTerm->id()]];
    }

    $subscription = $this->storage()->create($subscriptionData);
    $subscription->save();

    return TRUE;
  }

  /**
   * Get subscription by subscription UUID.
   */
  public function getBySubscriptionUuid(string $subscriptionUuid): ?Subscription {
    /** @var \Drupal\bnf_client\Entity\Subscription[] $subscriptions */
    $subscriptions = $this->storage()->loadByProperties([
      'subscription_uuid' => $subscriptionUuid,
    ]);

    if (!$subscriptions) {
      return NULL;
    }

    return reset($subscriptions);
  }

  /**
   * Delete a subscription.
   *
   * Only deletes the subscription, not any imported content on the
   * subscription.
   */
  public function delete(Subscription $subsciption): void {
    $this->storage()->delete([$subsciption]);

  }

  /**
   * Delete a subscription and it's content.
   *
   * Deletes content associated with the subscription if it's not part of any
   * other subscription, and it's either not locally claimed or it's
   * unpublished.
   */
  public function deleteWithContent(Subscription $subscription): void {
    $subscription->pruneContent = TRUE;
    $this->delete($subscription);
  }

  /**
   * Get the subscription storage.
   */
  protected function storage(): EntityStorageInterface {
    return $this->entityTypeManager->getStorage('bnf_subscription');
  }

}
