<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphGoMaterialSliderManual;

use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphGoMaterialSliderManual => go_material_slider_manual.
 */
#[BnfMapper(
  id: ParagraphGoMaterialSliderManual::class,
)]
class ParagraphGoMaterialSliderManualMapper extends BnfMapperParagraphPluginBase {

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!($object instanceof ParagraphGoMaterialSliderManual)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $workIds = $object->materialSliderWorkIds;
    $workIdsValues = [];

    foreach ($workIds as $workId) {
      $workIdsValues[] = [
        'value' => $workId->work_id,
        'material_type' => $workId->material_type,
      ];
    }

    return $this->paragraphStorage->create([
      'type' => 'go_material_slider_manual',
      'field_title' => $object->title,
      'field_material_slider_work_ids' => $workIdsValues,
    ]);

  }

}
