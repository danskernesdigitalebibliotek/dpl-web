<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphFiles;
use Drupal\bnf\Plugin\BnfMapperPluginParagraphBase;
use Drupal\bnf\Plugin\FieldTypeTraits\FileTrait;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphFiles => files.
 */
#[BnfMapper(
  id: ParagraphFiles::class,
)]
class ParagraphFilesMapper extends BnfMapperPluginParagraphBase {
  use FileTrait;

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
