<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Drush\Commands;

use Consolidation\OutputFormatters\StructuredData\RowsOfFields;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drush\Attributes\Argument;
use Drush\Attributes\Command;
use Drush\Attributes\FieldLabels;
use Drush\Attributes\Help;
use Drush\Attributes\Usage;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;
use Safe\DateTime;

/**
 * Commands for subscription management.
 */
class SubscriptionCommands extends DrushCommands {

  use AutowireTrait;

  /**
   * Subscription storage.
   */
  protected EntityStorageInterface $storage;

  /**
   * Constructor.
   */
  public function __construct(
    EntityTypeManagerInterface $entityTypeManager,
  ) {
    $this->storage = $entityTypeManager->getStorage('bnf_subscription');
    parent::__construct();
  }

  /**
   * Create subscription.
   */
  #[Command(name: 'bnf:subscription:create')]
  #[Help(description: 'Create a new subscription')]
  #[Argument(name: 'uuid', description: 'UUID to subscribe')]
  #[Usage(
    name: 'drush bnf:subscription:create 8f647000-cb67-40d0-b942-3f7fbf899c88',
    description: 'Subscribe to 8f647000-cb67-40d0-b942-3f7fbf899c88.'
  )]
  public function createSubscription(string $uuid = '', string $label = ''): void {
    $this->storage->create([
      'subscription_uuid' => $uuid,
      'label' => $label,
    ])
      ->save();
  }

  /**
   * Delete subscription.
   */
  #[Command(name: 'bnf:subscription:delete')]
  #[Help(description: 'Delete a subscription')]
  #[Argument(name: 'uuid', description: 'Subscription UUID (not the UUID of subscribed item)')]
  #[Usage(
    name: 'drush bnf:subscription:delete 4b426ec8-482d-401c-af0e-7f15dc9bfa5c',
    description: 'Delete the subscription with UUID 4b426ec8-482d-401c-af0e-7f15dc9bfa5c.'
  )]
  public function deleteSubscription(string $uuid = ''): void {
    $entities = $this->storage->loadMultiple(['uuid' => $uuid]);

    $this->storage->delete($entities);
  }

  /**
   * Delete all subscription.
   */
  #[Command(name: 'bnf:subscription:delete-all')]
  #[Help(description: 'Delete all subscriptions')]
  #[Usage(
    name: 'drush bnf:subscription:delete-all 4b426ec8-482d-401c-af0e-7f15dc9bfa5c',
    description: 'Delete all subscriptions'
  )]
  public function deleteAllSubscriptions(): void {
    $entities = $this->storage->loadMultiple();

    $this->storage->delete($entities);
  }

  /**
   * List subscriptions.
   */
  #[Command(name: 'bnf:subscription:list')]
  #[Help(description: 'List subscriptions')]
  #[FieldLabels(labels: [
    'uuid' => 'UUID',
    'subscription_uuid' => 'Subscription UUID',
    'label' => 'Label',
    'categories' => 'Categories for content',
    'tags' => 'Tags for content',
    'created' => 'Created',
    'last' => 'Last update',
  ])]
  public function listSubscriptions(): RowsOfFields {
    /** @var \Drupal\bnf_client\Entity\Subscription[] $subscriptions */
    $subscriptions = $this->storage->loadMultiple();

    $rows = [];

    foreach ($subscriptions as $subscription) {
      $last_pulled_timestamp = $subscription->getLast();
      $last_pulled = new DateTime("@$last_pulled_timestamp");
      $last_pulled->setTimezone(new \DateTimeZone('Europe/Copenhagen'));

      $created_timestamp = $subscription->created->value;
      $created = new DateTime("@$created_timestamp");
      $created->setTimezone(new \DateTimeZone('Europe/Copenhagen'));

      $rows[] = [
        'uuid' => $subscription->uuid->value,
        'label' => $subscription->label->value,
        'subscription_uuid' => $subscription->getSubscriptionUuid(),
        'tags' => implode(', ', array_map(fn($term) => "{$term->getName()} ({$term->id()})", $subscription->getTags())),
        'categories' => implode(', ', array_map(fn($term) => "{$term->getName()} ({$term->id()})", $subscription->getCategories())),
        'created' => "{$created->format('Y-m-d H:i')}\r\n({$created_timestamp})",
        'last' => "{$last_pulled->format('Y-m-d H:i')}\r\n({$last_pulled_timestamp})",
      ];
    }

    return new RowsOfFields($rows);
  }

}
