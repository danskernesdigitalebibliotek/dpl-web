<?php

declare(strict_types=1);

namespace Drupal\bnf_client\Entity;

use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Field\BaseFieldDefinition;

/**
 * Entity for BNF subscriptions.
 *
 * @ContentEntityType(
 *   id = "bnf_subscription",
 *   label = @Translation("Subscription"),
 *   plural_label = @Translation("Subscriptions"),
 *   base_table = "bnf_subscription",
 *   handlers = {
 *     "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
 *     "views_data" = "Drupal\views\EntityViewsData",
 *   },
 *   entity_keys = {
 *     "id" = "uuid",
 *   },
 * )
 */
class Subscription extends ContentEntityBase implements ContentEntityInterface {

  /**
   * Flag to tell the update hook not to queue a new content check.
   */
  public bool $noCheck = FALSE;

  /**
   * {@inheritDoc}
   *
   * @param array<string, mixed> $values
   *   An array of values to set, keyed by property name.
   */
  public function __construct(array $values = []) {
    parent::__construct($values, 'bnf_subscription');
  }

  /**
   * {@inheritDoc}
   */
  #[\Override]
  public static function baseFieldDefinitions(EntityTypeInterface $entity_type): array {
    $fields = [];

    $fields['uuid'] = BaseFieldDefinition::create('uuid')
      ->setLabel('UUID')
      ->setDescription('Primary identifier.')
      ->setRequired(TRUE);

    // Using an 'uuid' would seem obvious, but the UUID field generates a new
    // UUID as default value, so to avoid accidentally generating an UUID, we
    // use 'string' instead.
    $fields['subscription_uuid'] = BaseFieldDefinition::create('string')
      ->setLabel('Subscription UUID')
      ->setDescription('The UUID subscribed to.')
      ->setRequired(TRUE);

    $fields['created'] = BaseFieldDefinition::create('created')
      ->setLabel('Created')
      ->setDescription('The timestamp the subscription was made.');

    $fields['last'] = BaseFieldDefinition::create('timestamp')
      ->setLabel('Last seen')
      ->setDescription('The timestamp of the last synced content.');

    return $fields;
  }

  /**
   * Get the UUID subscribed to.
   */
  public function getSubscriptionUuid(): string {
    return $this->subscription_uuid->value;
  }

  /**
   * Get timestamp of the last synced content.
   */
  public function getLast(): int {
    return (int) ($this->last->value ?? 0);
  }

  /**
   * Set timestamp of the last synced content.
   */
  public function setLast(int $last): void {
    $this->last->value = $last;
  }

}
