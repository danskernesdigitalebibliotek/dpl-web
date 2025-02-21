<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphRecommendation;
use Drupal\bnf\Plugin\BnfMapperPluginParagraphBase;
use Drupal\bnf\Plugin\FieldTypeTraits\MaterialWorkIdTrait;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphRecommendation => recommendation.
 */
#[BnfMapper(
  id: ParagraphRecommendation::class,
)]
class ParagraphRecommendationMapper extends BnfMapperPluginParagraphBase {

  use MaterialWorkIdTrait;

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!$object instanceof ParagraphRecommendation) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    return $this->paragraphStorage->create([
      'type' => 'recommendation',
      'field_image_position_right' => $object->imagePositionRight ?? FALSE,
      'field_recommendation_description' => $object->recommendationDescription ?? NULL,
      'field_recommendation_title' => [
        'value' => $object->recommendationTitle->value ?? '',
        'format' => $object->recommendationTitle->format ?? '',
      ],
      'field_recommendation_work_id' => $this->getMaterialValue($object->recommendationWorkId),
    ]);

  }

}
