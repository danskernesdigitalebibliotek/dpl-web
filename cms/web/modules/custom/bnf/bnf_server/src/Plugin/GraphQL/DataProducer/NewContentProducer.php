<?php

declare(strict_types=1);

namespace Drupal\bnf_server\Plugin\GraphQL\DataProducer;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\bnf_server\GraphQL\NewContentResponse;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\node\Entity\Node;
use Safe\DateTime;

/**
 * Produces the result for the `newContent` query.
 *
 * It compiles a list of UUIDs of new content since the given `since`.
 *
 * @DataProducer(
 *   id = "new_content_producer",
 *   name = "New content producer",
 *   description = "Handles the newContent query.",
 *   produces = @ContextDefinition("any",
 *     label = "Request response"
 *   ),
 *   consumes = {
 *     "uuid" = @ContextDefinition("string", label = "UUID"),
 *     "since" = @ContextDefinition(
 *       "string",
 *       label =  "Since, in RFC 3339 format"
 *     )
 *   }
 * )
 */
class NewContentProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  use AutowirePluginTrait;

  /**
   * Node storage.
   */
  protected EntityStorageInterface $nodeStorage;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    EntityTypeManagerInterface $entityManager,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
    $this->nodeStorage = $entityManager->getStorage('node');
  }

  /**
   * Provide the response to the `newContent` query.
   */
  public function resolve(string $termUuid, string $since): NewContentResponse {
    $result = new NewContentResponse();

    try {
      $since = DateTime::createFromFormat(\DateTimeInterface::RFC3339, $since);
    }
    catch (\Throwable) {
      $result->addViolation('Invalid since supplied, should be in RFC 3339 format, i.e. "2005-08-15T15:52:01+00:00"');

      return $result;
    }

    $query = $this->nodeStorage->getQuery();
    $query->condition('created', $since->getTimestamp(), '>')
      ->condition('status', Node::PUBLISHED);

    $query->condition(
      $query->orConditionGroup()
        ->condition('field_categories.entity:taxonomy_term.uuid', $termUuid)
        ->condition('field_tags.entity:taxonomy_term.uuid', $termUuid)
    );

    $nids = $query->accessCheck(TRUE)->execute();
    $nodes = $this->nodeStorage->loadMultiple(array_keys($nids));
    $result->uuids = array_map(fn ($node) => (string) $node->uuid(), $nodes);

    return $result;
  }

}
