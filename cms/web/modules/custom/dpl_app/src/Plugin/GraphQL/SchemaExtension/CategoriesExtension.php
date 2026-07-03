<?php

declare(strict_types=1);

namespace Drupal\dpl_app\Plugin\GraphQL\SchemaExtension;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;

/**
 * App categories extension.
 *
 * @SchemaExtension(
 *   id = "dpl_app_categories",
 *   name = "App categories extension",
 *   description = "Exposes app categories via GraphQL",
 *   schema = "graphql_compose"
 * )
 */
class CategoriesExtension extends SdlSchemaExtensionPluginBase {

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry): void {
    $builder = new ResolverBuilder();

    $registry->addFieldResolver('Query', 'getAppCategories',
    $builder->produce('get_app_categories_producer')
      ->map('type', $builder->fromArgument('type'))
      ->map('id', $builder->fromArgument('id'))
    );

    $registry->addFieldResolver('AppCategory', 'id',
      $builder->callback(fn(ContentEntityInterface $category) => $category->uuid())
    );

    $registry->addFieldResolver('AppCategory', 'title',
      $builder->callback(fn(ContentEntityInterface $category) => $category->label())
    );

    $registry->addFieldResolver('AppCategory', 'icon',
    $builder->produce('app_category_icon_producer')
      ->map('entity', $builder->fromParent())
    );

    $registry->addFieldResolver('AppCategory', 'elements',
    $builder->produce('app_elements_producer')
      ->map('entity', $builder->fromParent())
    );

    // Without a resolver, graphql.module can't tell what the type of the
    // elements the app_elements_producer returns is.
    $registry->addTypeResolver('AppContentElement', function ($value) {
      if (is_array($value) && isset($value['__type'])) {
        return $value['__type'];
      }

      return NULL;
    });
  }

}
