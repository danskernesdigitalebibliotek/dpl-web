<?php

declare(strict_types=1);

namespace Drupal\bnf_server\Plugin\GraphQL\DataProducer;

use Drupal\bnf_server\GraphQL\NewContentResponse;
use Drupal\Core\DependencyInjection\AutowiredInstanceTrait;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Safe\DateTime;
use Symfony\Component\DependencyInjection\ContainerInterface;

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

  use AutowiredInstanceTrait;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected EntityTypeManagerInterface $entityTypeManager,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * Instantiates the plugin using autowiring.
   *
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   *   The container to pull out services used in the plugin.
   * @param mixed[] $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   *
   * @return static
   *   Returns an instance of this plugin.
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return static::createInstanceAutowired($container, $configuration, $plugin_id, $plugin_definition);
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
    $nodeStorage = $this->entityTypeManager->getStorage('node');
    $fieldContext->addCacheTags($nodeStorage->getEntityType()->getListCacheTags());
    $fieldContext->addCacheContexts($nodeStorage->getEntityType()->getListCacheContexts());

    $query = $nodeStorage->getQuery();
    $query->condition('changed', $since->getTimestamp(), '>');

    $query->condition(
      $query->orConditionGroup()
        ->condition('field_categories.entity:taxonomy_term.uuid', $termUuid)
        ->condition('field_tags.entity:taxonomy_term.uuid', $termUuid)
    );

    $nids = $query->accessCheck()->execute();

    /** @var \Drupal\node\Entity\Node[] $nodes */
    $nodes = $nodeStorage->loadMultiple(array_values($nids));

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
