<?php

declare(strict_types=1);

namespace Drupal\dpl_service_message\Hook;

use Drupal\Component\Utility\Unicode;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\Query\QueryInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\dpl_service_message\ServiceMessagePlacement;
use Drupal\dpl_service_message\Services\ServiceMessageLoader;
use Drupal\node\NodeInterface;

/**
 * Entity hooks for dpl_service_message module.
 */
class EntityHooks {
  use StringTranslationTrait;

  /**
   * The maximum length of the generated title.
   */
  protected const LABEL_LENGTH = 60;

  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
  ) {}

  /**
   * Set the title of a service message from its heading or body.
   *
   * Service messages have no title field on the form, but nodes require a
   * title, and the admin UI uses it.
   */
  #[Hook('node_presave')]
  public function generateLabel(NodeInterface $node): void {
    if ($node->bundle() !== ServiceMessageLoader::BUNDLE) {
      return;
    }

    $heading = trim((string) ($node->get('field_svcmsg_heading')->value ?? ''));
    $body = trim((string) ($node->get('field_svcmsg_body')->value ?? ''));
    $label = $heading ?: $body;

    // The content constraint prevents this on the form, but a node saved in
    // code can still be empty.
    if ($label === '') {
      $label = (string) $this->t('Service message', [], ['context' => 'dpl_service_message']);
    }

    $node->setTitle(Unicode::truncate($label, self::LABEL_LENGTH, TRUE, TRUE));
  }

  /**
   * Unpublish other global messages when one is published.
   *
   * Only one global message can be published at a time. This is checked on
   * save rather than in validation, because scheduler publishes messages on
   * cron without validating them.
   */
  #[Hook('node_insert')]
  #[Hook('node_update')]
  public function retireOtherGlobalMessages(NodeInterface $node): void {
    if ($node->bundle() !== ServiceMessageLoader::BUNDLE || !$node->isPublished()) {
      return;
    }

    if ($node->get('field_svcmsg_placement')->getString() !== ServiceMessagePlacement::GlobalBar->value) {
      return;
    }

    $storage = $this->entityTypeManager->getStorage('node');

    $ids = $storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('type', ServiceMessageLoader::BUNDLE)
      ->condition('status', NodeInterface::PUBLISHED)
      ->condition('field_svcmsg_placement', ServiceMessagePlacement::GlobalBar->value)
      ->condition('nid', $node->id(), '<>')
      ->execute();

    foreach ($storage->loadMultiple($ids) as $other) {
      $other->setUnpublished();
      $other->save();
    }
  }

  /**
   * Add the service message content constraint to nodes.
   *
   * The constraint checks several fields together, so it is added to the
   * entity type rather than a field. It ignores other bundles.
   *
   * @param array<string, \Drupal\Core\Entity\EntityTypeInterface> $entity_types
   *   The entity types, keyed by ID.
   */
  #[Hook('entity_type_alter')]
  public function addConstraints(array &$entity_types): void {
    $node = $entity_types['node'] ?? NULL;

    if (!$node instanceof EntityTypeInterface) {
      return;
    }

    $node->addConstraint('ServiceMessageContent');
  }

  /**
   * Exclude service messages from Linkit autocomplete suggestions.
   *
   * Service messages have no page worth linking to (KB-59). We exclude the
   * bundle here, rather than listing allowed bundles in the Linkit matcher
   * settings, so content types added later are linkable by default.
   */
  #[Hook('entity_query_tag__node__linkit_entity_autocomplete_alter')]
  public function excludeFromLinkitSuggestions(QueryInterface $query): void {
    $query->condition('type', ServiceMessageLoader::BUNDLE, '<>');
  }

}
