<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeArticle;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeGoArticle;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeGoCategory;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeGoPage;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodePage;
use Drupal\bnf\Plugin\Traits\DateTimeTrait;
use Drupal\bnf\Plugin\Traits\ImageTrait;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\FileRepositoryInterface;
use Drupal\node\NodeInterface;

/**
 * Base class for BNF mapper node plugins.
 */
abstract class BnfMapperNodePluginBase extends BnfMapperPluginBase {
  use ImageTrait;
  use DateTimeTrait;

  /**
   * Entity storage to create node in.
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
    protected EntityTypeManagerInterface $entityTypeManager,
    protected FileSystemInterface $fileSystem,
    protected FileRepositoryInterface $fileRepository,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);

    $this->nodeStorage = $entityTypeManager->getStorage('node');
  }

  /**
   * Getting the existing node, or creating it from scratch.
   */
  public function getNode(NodeArticle|NodePage|NodeGoArticle|NodeGoCategory|NodeGoPage $object, string $bundle): NodeInterface {
    /** @var \Drupal\node\Entity\Node[] $existing */
    $existing = $this->nodeStorage->loadByProperties(['uuid' => $object->id]);

    if ($existing) {
      $node = reset($existing);
    }
    else {
      /** @var \Drupal\node\Entity\Node $node */
      $node = $this->nodeStorage->create([
        'type' => $bundle,
        'uuid' => $object->id,
      ]);
    }

    $node->set('title', $object->title);
    $node->set('status', $object->status ? NodeInterface::PUBLISHED : NodeInterface::NOT_PUBLISHED);

    return $node;
  }

}
