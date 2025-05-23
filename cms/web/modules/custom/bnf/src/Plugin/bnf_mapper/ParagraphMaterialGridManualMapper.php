<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridManual;

use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphMaterialGridManual => material_grid_manual.
 */
#[BnfMapper(
  id: ParagraphMaterialGridManual::class,
)]
class ParagraphMaterialGridManualMapper extends BnfMapperParagraphPluginBase {

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!($object instanceof ParagraphMaterialGridManual)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    $workIds = $object->materialGridWorkIds ?? [];
    $workIdsValues = [];

    foreach ($workIds as $workId) {
      $workIdsValues[] = [
        'value' => $workId->work_id,
        'material_type' => $workId->material_type,
      ];
    }

    return $this->paragraphStorage->create([
      'type' => 'material_grid_manual',
      'field_material_grid_title' => $object->materialGridTitle,
      'field_material_grid_description' => $object->materialGridDescription,
      'field_material_grid_work_ids' => $workIdsValues,
    ]);

  }

}
