<?php

declare(strict_types=1);

namespace Drupal\bnf_server\Plugin\GraphQL\DataProducer;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\bnf_server\GraphQL\NewContentResponse;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
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
  public function resolve(string $termUuid, string $since, FieldContext $fieldContext): NewContentResponse {
    $result = new NewContentResponse();

    try {
      $since = DateTime::createFromFormat(\DateTimeInterface::RFC3339, $since);
    }
    catch (\Throwable) {
      $result->addViolation('Invalid since supplied, should be in RFC 3339 format, i.e. "2005-08-15T15:52:01+00:00"');

      return $result;
    }

    // The `node_list` cache tag is cleared when saving any node, so we'll be
    // able to catch both changes to existing nodes and new nodes.
    $fieldContext->addCacheTags($this->nodeStorage->getEntityType()->getListCacheTags());
    $fieldContext->addCacheContexts($this->nodeStorage->getEntityType()->getListCacheContexts());

    $query = $this->nodeStorage->getQuery();
    $query->condition('changed', $since->getTimestamp(), '>');

    $query->condition(
      $query->orConditionGroup()
        ->condition('field_categories.entity:taxonomy_term.uuid', $termUuid)
        ->condition('field_tags.entity:taxonomy_term.uuid', $termUuid)
    );

    $nids = $query->accessCheck()->execute();

    /** @var \Drupal\node\Entity\Node[] $nodes */
    $nodes = $this->nodeStorage->loadMultiple(array_keys($nids));

    if ($nodes) {
      $result->uuids = array_map(fn ($node) => (string) $node->uuid(), $nodes);

      $youngest = array_reduce($nodes, fn ($youngest, $node) => max($youngest, $node->changed->value), 0);
      $youngest = new DateTime("@$youngest");
      $result->youngest = $youngest->format(\DateTimeInterface::RFC3339);
    }
    else {
      $result->youngest = $since->format(\DateTimeInterface::RFC3339);
    }

    return $result;
  }

}
