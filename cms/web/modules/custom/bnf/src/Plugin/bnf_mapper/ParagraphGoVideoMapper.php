<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideo;

use Drupal\bnf\Plugin\Traits\EmbedVideoTrait;
use Drupal\bnf\Plugin\Traits\LinkTrait;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphGoVideo => video.
 */
#[BnfMapper(
  id: ParagraphGoVideo::class,
  )]
class ParagraphGoVideoMapper extends BnfMapperParagraphPluginBase {

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
      'field_go_video_title' => $object->title,
      'field_embed_video' => $this->getEmbedVideoValue($object->embedVideo),
    ]);

  }

}
