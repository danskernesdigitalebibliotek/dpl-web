<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphFiles;

use Drupal\bnf\Plugin\Traits\FileTrait;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\FileRepositoryInterface;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphFiles => files.
 */
#[BnfMapper(
  id: ParagraphFiles::class,
)]
class ParagraphFilesMapper extends BnfMapperParagraphPluginBase {
  use FileTrait;

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

    if (!$object instanceof ParagraphFiles) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $files = $object->files ?? [];
    $filesValues = [];

    foreach ($files as $file) {
      $filesValues[] = $this->getFileValue($file);
    }

    return $this->paragraphStorage->create([
      'type' => 'files',
      'field_files' => $filesValues,
    ]);

  }

}
