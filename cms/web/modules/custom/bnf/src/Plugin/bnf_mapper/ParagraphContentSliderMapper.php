<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphContentSlider;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphContentSlider => content_slider.
 */
#[BnfMapper(
  id: ParagraphContentSlider::class,
)]
class ParagraphContentSliderMapper extends BnfMapperPluginBase {

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    // Don't map this paragraph.
    return [];
  }

}
