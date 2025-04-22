<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\GraphQL\DataProducer;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\node\NodeInterface;
use Drupal\path_alias\AliasManagerInterface;
use function Safe\preg_match;

/**
 * Produces the UUID of internal content links.
 *
 * @DataProducer(
 *   id = "linked_content_uuid_producer",
 *   name = "Linked content UUID producer",
 *   description = "Supplies the UUID of internally linked content.",
 *   produces = @ContextDefinition("string",
 *     label = "Request response",
 *     required = FALSE
 *   ),
 *   consumes = {
 *     "link" = @ContextDefinition("any", label = "Link field data")
 *   }
 * )
 */
class LinkedContentUuidProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  use AutowirePluginTrait;

  /**
   * Node storage.
   */
  protected EntityStorageInterface $nodeStorage;

  /**
   * Constructor.
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    EntityTypeManagerInterface $entityTypeManager,
    protected AliasManagerInterface $aliasManager,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);

    $this->nodeStorage = $entityTypeManager->getStorage('node');
  }

  /**
   * Get the UUID.
   *
   * @param array{title: string, url: string, internal: bool} $link
   *   The link field data.
   */
  public function resolve($link): ?string {
    // While the link field contains the path `internal:node/19`, and it stores
    // which entity type and ID the link points to for internal links, all we
    // have to work with here is the external GraphQL representation.
    if ($link['internal']) {
      $path = $this->aliasManager->getPathByAlias($link['url']);

      if (preg_match('{^/node/(\d+)$}', $path, $matches)) {
        $node = $this->nodeStorage->load($matches[1]);

        if ($node instanceof NodeInterface && $node->isPublished()) {
          return $node->uuid();
        }
      }
    }

    return NULL;
  }

}
