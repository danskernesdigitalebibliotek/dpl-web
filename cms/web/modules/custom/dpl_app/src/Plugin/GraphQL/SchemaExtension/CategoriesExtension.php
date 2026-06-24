<?php

declare(strict_types=1);

namespace Drupal\dpl_app\Plugin\GraphQL\SchemaExtension;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

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
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static {
    $instance = parent::create($container, $configuration, $plugin_id, $plugin_definition);
    return $instance;
  }

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

    // @todo implement
    $registry->addFieldResolver('AppCategory', 'elements',
    $builder->callback(fn(ContentEntityInterface $category) => [])
    );
  }

}
