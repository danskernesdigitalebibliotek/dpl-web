<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeGoPage;
use Drupal\bnf\Plugin\Traits\DateTimeTrait;
use Drupal\bnf\Plugin\Traits\ImageTrait;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\FileRepositoryInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Maps GO page nodes.
 */
#[BnfMapper(
  id: NodeGoPage::class,
)]
class NodeGoPageMapper extends BnfMapperPluginBase {
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
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!$object instanceof NodeGoPage) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    /** @var \Drupal\node\Entity\Node[] $existing */
    $existing = $this->nodeStorage->loadByProperties(['uuid' => $object->id]);

    if ($existing) {
      $node = reset($existing);
    }
    else {
      /** @var \Drupal\node\Entity\Node $node */
      $node = $this->nodeStorage->create([
        'type' => 'go_page',
        'uuid' => $object->id,
      ]);
    }

    $node->set('title', $object->title);
    $node->set('field_publication_date', $this->getDateTimeValue($object->publicationDate, FALSE));

    // The canonical URL field does not exist yet, but will eventually.
    if (isset($object->canonicalUrl) && $node->hasField('field_canonical_url')) {
      $node->set('field_canonical_url', [
        'uri' => $object->canonicalUrl->url,
      ]);
    }

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
