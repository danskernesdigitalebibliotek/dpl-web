<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeArticle as GraphQLNodeArticle;
use Drupal\bnf\Plugin\BnfMapperPluginBase;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Maps article nodes.
 */
#[BnfMapper(
  id: GraphQLNodeArticle::class,
)]
class NodeArticle extends BnfMapperPluginBase {

  /**
   * Node storage to create node in.
   */
  protected EntityStorageInterface $nodeStorage;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    array $pluginDefinition,
    protected BnfMapperManager $manager,
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
      'uuid' => $object->id,
    ]);

    $node->set('title', $object->title);

    if ($object->paragraphs) {
      $paragraphs = [];

      foreach ($object->paragraphs as $paragraph) {
        $paragraphs[] = $this->manager->map($paragraph);
      }

      $node->set('field_paragraphs', $paragraphs);
    }

    return $node;
  }

}
