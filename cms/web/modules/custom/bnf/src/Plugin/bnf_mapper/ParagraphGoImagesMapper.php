<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoImages;

use Drupal\bnf\Plugin\Traits\ImageTrait;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\FileRepositoryInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphGoImages => go_images.
 */
#[BnfMapper(
  id: ParagraphGoImages::class,
)]
class ParagraphGoImagesMapper extends BnfMapperParagraphPluginBase {
  use ImageTrait;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    array $pluginDefinition,
    protected EntityTypeManagerInterface $entityTypeManager,
    protected FileSystemInterface $fileSystem,
    protected FileRepositoryInterface $fileRepository,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition, $entityTypeManager);
  }

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {

    if (!$object instanceof ParagraphGoImages) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $medias = $object->goImages;
    $mediasValues = [];

    foreach ($medias as $media) {
      $mediasValues[] = $this->getImageValue($media);
    }

    return $this->paragraphStorage->create([
      'type' => 'go_images',
      'field_go_images' => $mediasValues,
    ]);

  }

}
