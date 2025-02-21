<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoMaterialSliderAutomatic;
use Drupal\bnf\Plugin\BnfMapperPluginParagraphBase;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphGoMaterialSliderAutomatic => go_material_slider_automatic.
 */
#[BnfMapper(
  id: ParagraphGoMaterialSliderAutomatic::class,
)]
class ParagraphGoMaterialSliderAutomaticMapper extends BnfMapperPluginParagraphBase {

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!($object instanceof ParagraphGoMaterialSliderAutomatic)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    return $this->paragraphStorage->create([
      'type' => 'go_material_slider_automatic',
      'field_title' => $object->title,
      'field_slider_amount_of_materials' => $object->sliderAmountOfMaterials ?? 8,
      'field_cql_search' => [
        'value' => $object->cqlSearch->value,
      ],
    ]);

  }

}
