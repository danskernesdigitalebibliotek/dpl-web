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
    // UUID as default value, so to avoid actidentially generating an UUID, we
    // use 'string' instead.
    $fields['subscription_uuid'] = BaseFieldDefinition::create('string')
      ->setLabel('Subscription UUID')
      ->setDescription('The UUID subscribed to.')
      ->setRequired(TRUE);

    $fields['created'] = BaseFieldDefinition::create('created')
      ->setLabel('Created')
      ->setDescription('The timestamp the subscription was made.');

    return $fields;
  }

}
