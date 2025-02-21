<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridLinkAutomatic;
use Drupal\bnf\Plugin\BnfMapperPluginParagraphBase;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphMaterialGridLinkAutomatic => material_grid_link_automatic.
 */
#[BnfMapper(
  id: ParagraphMaterialGridLinkAutomatic::class,
)]
class ParagraphMaterialGridLinkAutomaticMapper extends BnfMapperPluginParagraphBase {

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!($object instanceof ParagraphMaterialGridLinkAutomatic)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    return $this->paragraphStorage->create([
      'type' => 'material_grid_link_automatic',
      'field_material_grid_title' => $object->materialGridTitle,
      'field_material_grid_description' => $object->materialGridDescription,
      'field_amount_of_materials' => $object->amountOfMaterials ?? 8,
      'field_material_grid_link' => $object->materialGridLink,
    ]);

  }

}
