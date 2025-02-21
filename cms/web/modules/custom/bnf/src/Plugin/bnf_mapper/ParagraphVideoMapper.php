<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphVideo;
use Drupal\bnf\Plugin\BnfMapperPluginParagraphBase;
use Drupal\bnf\Plugin\FieldTypeTraits\EmbedVideoTrait;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphVideo => video.
 */
#[BnfMapper(
  id: ParagraphVideo::class,
  )]
class ParagraphVideoMapper extends BnfMapperPluginParagraphBase {

  use EmbedVideoTrait;

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!($object instanceof ParagraphVideo)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    return $this->paragraphStorage->create([
      'type' => 'video',
      'field_embed_video' => $this->getEmbedVideoValue($object->embedVideo),
    ]);

  }

}
