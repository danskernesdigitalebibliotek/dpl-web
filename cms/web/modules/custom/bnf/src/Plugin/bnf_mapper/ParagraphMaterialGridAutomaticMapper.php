<?php

declare(strict_types=1);

namespace Drupal\bnf\Plugin\bnf_mapper;

use Drupal\bnf\Attribute\BnfMapper;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\ParagraphMaterialGridAutomatic;
use Drupal\bnf\Plugin\BnfMapperPluginParagraphBase;
use Drupal\bnf\Plugin\FieldTypeTraits\MaterialWorkIdTrait;
use Spawnia\Sailor\ObjectLike;

/**
 * Mapping ParagraphMaterialGridAutomatic => material_grid_automatic.
 */
#[BnfMapper(
  id: ParagraphMaterialGridAutomatic::class,
)]
class ParagraphMaterialGridAutomaticMapper extends BnfMapperPluginParagraphBase {
  use MaterialWorkIdTrait;

  /**
   * {@inheritdoc}
   */
  public function map(ObjectLike $object): mixed {
    if (!($object instanceof ParagraphMaterialGridAutomatic)) {
      throw new \RuntimeException('Wrong class handed to mapper');
    }

    return $this->paragraphStorage->create([
      'type' => 'material_grid_automatic',
      'field_material_grid_title' => $object->materialGridTitle,
      'field_material_grid_description' => $object->materialGridDescription,
      'field_cql_search' => ['value' => $object->cqlSearch->value],
    ]);

  }

}
