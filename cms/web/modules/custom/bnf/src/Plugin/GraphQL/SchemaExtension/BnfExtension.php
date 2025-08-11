<?php

namespace Drupal\bnf\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;

/**
 * Extends the GraphQL schema with BNF extensions.
 *
 * @SchemaExtension(
 *   id = "bnf_extension",
 *   name = "BNF Extension",
 *   schema = "graphql_compose"
 * )
 */
class BnfExtension extends SdlSchemaExtensionPluginBase {

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry): void {
    $builder = new ResolverBuilder();

    $registry->addFieldResolver('NodeInterface', 'url', $builder->compose(
      $builder->produce('entity_url')
        ->map('entity', $builder->fromParent())
        ->map('options', $builder->fromValue(['absolute' => TRUE])),
      $builder->produce('url_path')
        ->map('url', $builder->fromParent())
    ));

    $registry->addFieldResolver('NodeInterface', 'bundle', $builder->compose(
      $builder->produce('entity_bundle')
        ->map('entity', $builder->fromParent())
    ));

    // Export entity reference fields, as simple UUIDs.
    // This is not the "graphQL way" of doing things, but, it makes it much
    // easier for us to recursively import linked content.
    $referenceFields = [
      [
        'parent' => 'ParagraphNavGridManual',
        'field_name' => 'field_content_references',
        'output_field_name' => 'contentReferenceUuids',
      ],
      [
        'parent' => 'ParagraphNavSpotsManual',
        'field_name' => 'field_nav_spots_content',
        'output_field_name' => 'navSpotsContentUuids',
      ],
      [
        'parent' => 'ParagraphCardGridManual',
        'field_name' => 'field_grid_content',
        'output_field_name' => 'gridContentUuids',
      ],

    ];

    foreach ($referenceFields as $field) {
      $registry->addFieldResolver($field['parent'], $field['output_field_name'],
        $builder->callback(function ($paragraph) use ($field) {
          $refs = $paragraph->get($field['field_name'])->referencedEntities();
          return array_values(array_filter(array_map(function ($entity) {
            return $entity->uuid();
          }, $refs)));
        })
      );
    }

    $thumbnailFields = ['MediaVideo', 'MediaVideotool'];

    foreach ($thumbnailFields as $field) {
      $registry->addFieldResolver($field, 'thumbnail', $builder->compose(
        $builder->produce('property_path')
          ->map('type', $builder->fromValue('entity:media'))
          ->map('value', $builder->fromParent())
          ->map('path', $builder->fromValue('thumbnail.entity')),
        $builder->produce('image_url')
          ->map('entity', $builder->fromParent())
      ));
    }

  }

}
