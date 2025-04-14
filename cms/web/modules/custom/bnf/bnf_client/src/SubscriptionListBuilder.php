<?php

namespace Drupal\bnf_client;

use Drupal\bnf_client\Entity\Subscription;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Safe\DateTime;

/**
 * Defines a class to build a listing of bnf_subscription entities.
 */
class SubscriptionListBuilder extends EntityListBuilder {

  /**
   * Building the row header.
   *
   * @return string[]
   *   The row header, containing labels for each value.
   */
  public function buildHeader() {
    $header['label'] = $this->t('Label', [], ['context' => 'BNF']);
    $header['categories'] = $this->t('Categories', [], ['context' => 'BNF']);
    $header['tags'] = $this->t('Tags', [], ['context' => 'BNF']);
    $header['created'] = $this->t('Created', [], ['context' => 'BNF']);
    $header['last_updated'] = $this->t('Last updated content', [], ['context' => 'BNF']);

    return $header + parent::buildHeader();
  }

  /**
   * Building the row of values.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The subscription entity.
   *
   * @return string[]
   *   The row, containing values for each subscription.
   */
  public function buildRow(EntityInterface $entity): array {
    if (!($entity instanceof Subscription)) {
      return [];
    }

    $last_pulled_timestamp = $entity->getLast();
    $last_pulled = new DateTime("@$last_pulled_timestamp");
    $last_pulled->setTimezone(new \DateTimeZone('Europe/Copenhagen'));

    $created_timestamp = $entity->created->value;
    $created = new DateTime("@$created_timestamp");
    $created->setTimezone(new \DateTimeZone('Europe/Copenhagen'));

    $row = [
      'label' => $entity->label->value,
      'tags' => implode(', ', array_map(fn($term) => $term->getName(), $entity->getTags())),
      'categories' => implode(', ', array_map(fn($term) => $term->getName(), $entity->getCategories())),
      'created' => $created_timestamp ? $created->format('Y-m-d H:i') : NULL,
      'last' => $last_pulled_timestamp ? $last_pulled->format('Y-m-d H:i') : NULL,
    ];

    return $row + parent::buildRow($entity);
  }

}
