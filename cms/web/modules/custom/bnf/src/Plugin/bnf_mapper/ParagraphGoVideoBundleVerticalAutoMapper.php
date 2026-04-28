<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideoBundleVerticalAuto;

use Drupal\bnf\Plugin\Traits\EmbedVideoTrait;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphGoVideoBundleVerticalAuto => go_video_bundle_vertical_auto.
 */
#[BnfMapper(
  id: ParagraphGoVideoBundleVerticalAuto::class,
)]
class ParagraphGoVideoBundleVerticalAutoMapper extends BnfMapperParagraphPluginBase {

  use EmbedVideoTrait;

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!($object instanceof ParagraphGoVideoBundleVerticalAuto)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    return $this->paragraphStorage->create([
      'type' => 'go_video_bundle_vertical_auto',
      'field_go_video_title' => $object->goVideoTitle,
      'field_embed_video' => $this->getEmbedVideoValue($object->embedVideo),
      'field_video_amount_of_materials' => $object->videoAmountOfMaterials,
      'field_cql_search' => ['value' => $object->cqlSearch?->value],
    ]);

  }

}
