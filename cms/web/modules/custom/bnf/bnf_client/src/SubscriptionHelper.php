<?php

declare(strict_types=1);

namespace Drupal\bnf_client;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\taxonomy\Entity\Term;

/**
 * Helpers for interacting with subscriptions.
 */
class SubscriptionHelper {

  public function __construct(protected EntityTypeManagerInterface $entityTypeManager) {}

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
    $subscriptionStorage = $this->entityTypeManager->getStorage('bnf_subscription');

    /** @var \Drupal\bnf_client\Entity\Subscription[] $existing */
    $existing = $subscriptionStorage->loadByProperties([
      'subscription_uuid' => $subscriptionUuid,
    ]);

    if ($existing) {
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

    $subscription = $subscriptionStorage->create($subscriptionData);
    $subscription->save();

    return TRUE;
  }

}
