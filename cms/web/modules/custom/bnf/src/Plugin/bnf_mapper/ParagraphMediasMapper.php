<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMedias;
use Drupal\bnf\Plugin\BnfMapperPluginParagraphBase;
use Drupal\bnf\Plugin\FieldTypeTraits\ImageTrait;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphMedias => medias.
 */
#[BnfMapper(
  id: ParagraphMedias::class,
)]
class ParagraphMediasMapper extends BnfMapperPluginParagraphBase {
  use ImageTrait;

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
