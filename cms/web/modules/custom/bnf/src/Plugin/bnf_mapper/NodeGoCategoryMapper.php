<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\BnfMapperManager;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\NodeGoCategory;
use Drupal\bnf\Plugin\Traits\DateTimeTrait;
use Drupal\bnf\Plugin\Traits\ImageTrait;
use Drupal\bnf\Plugin\Traits\SoundTrait;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\FileRepositoryInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Maps GO category nodes.
 */
#[BnfMapper(
  id: NodeGoCategory::class,
)]
class NodeGoCategoryMapper extends BnfMapperPluginBase {
  use ImageTrait;
  use DateTimeTrait;
  use SoundTrait;

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
    if (!$object instanceof NodeGoCategory) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    /** @var \Drupal\node\Entity\Node $node */
    $node = $this->nodeStorage->create([
      'type' => 'go_category',
      'uuid' => $object->id,
    ]);

    $node->set('title', $object->title);
    $node->set('field_publication_date', $this->getDateTimeValue($object->publicationDate, FALSE));
    $node->set('field_go_color', $object->goColor);
    $node->set('field_category_menu_image', $this->getImageValue($object->categoryMenuImage));
    $node->set('field_category_menu_sound', $this->getSoundValue($object->categoryMenuSound));
    $node->set('field_category_menu_title', $object->categoryMenuTitle);

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
