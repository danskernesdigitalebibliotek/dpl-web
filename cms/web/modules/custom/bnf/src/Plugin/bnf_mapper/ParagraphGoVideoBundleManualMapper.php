<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideoBundleManual;
use Drupal\bnf\Plugin\BnfMapperPluginParagraphBase;
use Drupal\bnf\Plugin\FieldTypeTraits\EmbedVideoTrait;
use Drupal\bnf\Plugin\FieldTypeTraits\MaterialWorkIdTrait;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphGoVideoBundleManual => go_video_bundle_manual.
 */
#[BnfMapper(
  id: ParagraphGoVideoBundleManual::class,
)]
class ParagraphGoVideoBundleManualMapper extends BnfMapperPluginParagraphBase {

  use MaterialWorkIdTrait;
  use EmbedVideoTrait;

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!($object instanceof ParagraphGoVideoBundleManual)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $workIds = $object->videoBundleWorkIds ?? [];
    $workIdsValues = [];

    foreach ($workIds as $workId) {
      $workIdsValues[] = $this->getMaterialValue($workId);
    }

    return $this->paragraphStorage->create([
      'type' => 'go_video_bundle_manual',
      'field_go_video_title' => $object->goVideoTitle,
      'field_video_bundle_work_ids' => $workIdsValues,
      'field_url' => $object->url,
      'field_embed_video' => $this->getEmbedVideoValue($object->embedVideo),
    ]);

  }

}
