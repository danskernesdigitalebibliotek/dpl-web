<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeArticle;
use Drupal\bnf\Plugin\Traits\DateTimeTrait;
use Drupal\bnf\Plugin\Traits\ImageTrait;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\FileRepositoryInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Maps article nodes.
 */
#[BnfMapper(
  id: NodeArticle::class,
)]
class NodeArticleMapper extends BnfMapperPluginBase {
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
    if (!$object instanceof NodeArticle) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    /** @var \Drupal\node\Entity\Node $node */
    $node = $this->nodeStorage->create([
      'type' => 'article',
      'uuid' => $object->id,
    ]);

    $node->set('title', $object->title);
    $node->set('field_subtitle', $object->subtitle);
    $node->set('field_override_author', $object->overrideAuthor);
    $node->set('field_show_override_author', $object->showOverrideAuthor);
    $node->set('field_publication_date', $this->getDateTimeValue($object->publicationDate, FALSE));
    $node->set('field_teaser_text', $object->teaserText);
    $node->set('field_teaser_image', $this->getImageValue($object->teaserImage));

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
