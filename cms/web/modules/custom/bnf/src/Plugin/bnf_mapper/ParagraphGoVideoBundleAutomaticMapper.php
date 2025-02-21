<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoVideoBundleAutomatic;
use Drupal\bnf\Plugin\BnfMapperPluginParagraphBase;
use Drupal\bnf\Plugin\FieldTypeTraits\EmbedVideoTrait;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphGoVideoBundleAutomatic => go_video_bundle_automatic.
 */
#[BnfMapper(
  id: ParagraphGoVideoBundleAutomatic::class,
)]
class ParagraphGoVideoBundleAutomaticMapper extends BnfMapperPluginParagraphBase {

  use EmbedVideoTrait;

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!($object instanceof ParagraphGoVideoBundleAutomatic)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    return $this->paragraphStorage->create([
      'type' => 'go_video_bundle_automatic',
      'field_go_video_title' => $object->goVideoTitle,
      'field_url' => $object->url,
      'field_embed_video' => $this->getEmbedVideoValue($object->embedVideo),
      'field_video_amount_of_materials' => $object->videoAmountOfMaterials,
      'field_cql_search' => ['value' => $object->cqlSearch->value],
    ]);

  }

}
