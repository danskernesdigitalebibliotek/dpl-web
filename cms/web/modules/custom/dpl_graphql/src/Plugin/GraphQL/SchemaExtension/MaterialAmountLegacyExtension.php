<?php

namespace Drupal\dpl_graphql\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;
use Drupal\paragraphs\ParagraphInterface;

/**
 * Legacy support for the amountOfMaterials field.
 *
 * The field was renamed from field_amount_of_materials to field_material_amount
 * but the app still uses the old GraphQL field name (amountOfMaterials).
 *
 * @see https://reload.atlassian.net/browse/DDFSAL-577
 *
 * @SchemaExtension(
 *   id = "dpl_graphql_material_amount_legacy",
 *   name = "Material Amount Legacy Extension",
 *   description = "Provides amountOfMaterials as an alias for materialAmount",
 *   schema = "graphql_compose"
 * )
 */
class MaterialAmountLegacyExtension extends SdlSchemaExtensionPluginBase {

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry): void {
    $builder = new ResolverBuilder();

    $paragraphTypes = [
      'ParagraphMaterialGridAutomatic',
      'ParagraphMaterialGridLinkAutomatic',
    ];

    foreach ($paragraphTypes as $paragraphType) {
      $registry->addFieldResolver($paragraphType, 'amountOfMaterials',
        $builder->callback(fn(ParagraphInterface $paragraph) =>
          (int) $paragraph->get('field_material_amount')->getString()
        )
      );
    }
  }

}
