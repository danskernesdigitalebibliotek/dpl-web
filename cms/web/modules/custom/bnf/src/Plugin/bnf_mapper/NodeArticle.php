<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\BnfStateEnum;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeArticle as GraphQLNodeArticle;
use Drupal\bnf\Plugin\BnfMapperPluginBase;
use Drupal\node\NodeInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Maps article nodes.
 */
#[BnfMapper(
  id: GraphQLNodeArticle::class,
)]
class NodeArticle extends BnfMapperPluginBase {

  protected EntityStorageInterface $nodeStorage;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    array $pluginDefinition,
    EntityTypeManagerInterface $entityTypeManager,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);

    $this->nodeStorage = $entityTypeManager->getStorage('node');
  }

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!$object instanceof GraphQLNodeArticle) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    /** @var \Drupal\node\Entity\Node $node */
    $node = $this->nodeStorage->create([
      'type' => 'article',
      'status' => NodeInterface::NOT_PUBLISHED,
      'uuid' => $object->id,
    ]);

    $node->set('title', $object->title);

    // Mark the node as imported.
    $node->set(BnfStateEnum::FIELD_NAME, BnfStateEnum::Imported->value);

    return $node;
  }

}
