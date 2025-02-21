<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridManual;
use Drupal\bnf\Plugin\BnfMapperPluginParagraphBase;
use Drupal\bnf\Plugin\FieldTypeTraits\MaterialWorkIdTrait;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphMaterialGridManual => material_grid_manual.
 */
#[BnfMapper(
  id: ParagraphMaterialGridManual::class,
)]
class ParagraphMaterialGridManualMapper extends BnfMapperPluginParagraphBase {
  use MaterialWorkIdTrait;

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
      $workIdsValues[] = $this->getMaterialValue($workId);
    }

    return $this->paragraphStorage->create([
      'type' => 'material_grid_manual',
      'field_material_grid_title' => $object->materialGridTitle,
      'field_material_grid_description' => $object->materialGridDescription,
      'field_material_grid_work_ids' => $workIdsValues,
    ]);

  }

}
