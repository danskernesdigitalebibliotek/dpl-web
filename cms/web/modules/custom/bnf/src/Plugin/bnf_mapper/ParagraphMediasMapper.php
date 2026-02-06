<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMedias;

use Drupal\bnf\Plugin\Traits\ImageTrait;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\FileRepositoryInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphMedias => medias.
 */
#[BnfMapper(
  id: ParagraphMedias::class,
)]
class ParagraphMediasMapper extends BnfMapperParagraphPluginBase {
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

    if (!$object instanceof ParagraphMedias) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $medias = $object->medias;
    $mediasValues = [];

    foreach ($medias as $media) {
      $mediasValues[] = $this->getImageValue($media);
    }

    return $this->paragraphStorage->create([
      'type' => 'medias',
      'field_medias' => $mediasValues,
    ]);

  }

}
