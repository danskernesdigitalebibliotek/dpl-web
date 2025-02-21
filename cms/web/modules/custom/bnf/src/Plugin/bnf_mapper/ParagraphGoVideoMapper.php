<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideo;
use Drupal\bnf\Plugin\BnfMapperPluginParagraphBase;
use Drupal\bnf\Plugin\FieldTypeTraits\EmbedVideoTrait;
use Drupal\bnf\Plugin\FieldTypeTraits\LinkTrait;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphGoVideo => video.
 */
#[BnfMapper(
  id: ParagraphGoVideo::class,
  )]
class ParagraphGoVideoMapper extends BnfMapperPluginParagraphBase {

  use EmbedVideoTrait;
  use LinkTrait;

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!($object instanceof ParagraphGoVideo)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    return $this->paragraphStorage->create([
      'type' => 'video',
      'field_go_video_title' => $object->titleRequired,
      'field_embed_video' => $this->getEmbedVideoValue($object->embedVideo),
      'field_url' => $object->url,
    ]);

  }

}
