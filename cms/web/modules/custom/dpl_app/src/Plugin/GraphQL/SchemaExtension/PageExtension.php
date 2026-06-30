<?php

declare(strict_types=1);

namespace Drupal\dpl_app\Plugin\GraphQL\SchemaExtension;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Field\EntityReferenceFieldItemList;
use Drupal\file\Entity\File;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * App page extension.
 *
 * @SchemaExtension(
 *   id = "dpl_app_page",
 *   name = "App page extension",
 *   description = "Exposes nodes as app pages via GraphQL",
 *   schema = "graphql_compose"
 * )
 */
class PageExtension extends SdlSchemaExtensionPluginBase {

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

    $registry->addFieldResolver('Query', 'getAppPage',
    $builder->produce('entity_load_by_uuid')
      ->map('type', $builder->fromValue('node'))
      ->map('uuid', $builder->fromArgument('id'))
    );

    $registry->addFieldResolver('AppPage', 'title',
      $builder->callback(fn(ContentEntityInterface $page) => $page->label())
    );

    $registry->addFieldResolver('AppPage', 'subtitle',
    $builder->callback(fn(ContentEntityInterface $page) => $page->hasField('field_subtitle') ? $page->get('field_subtitle')->value : '')
    );

    $registry->addFieldResolver('AppPage', 'image',
    $builder->callback(function (ContentEntityInterface $page) {
      $media = NULL;
      if ($page->hasField('field_category_menu_image') && !$page->get('field_category_menu_image')->isEmpty()) {
        $medias = $page->get('field_category_menu_image');
        if ($medias instanceof EntityReferenceFieldItemList) {
          $media = $medias->referencedEntities()[0] ?? NULL;
        }
      }
      if (!$media && $page->hasField('field_teaser_image') && !$page->get('field_teaser_image')->isEmpty()) {
        $medias = $page->get('field_teaser_image');
        if ($medias instanceof EntityReferenceFieldItemList) {
          $media = $medias->referencedEntities()[0] ?? NULL;
        }
      }

      if ($media instanceof ContentEntityInterface && $media->hasField('field_media_image') && !$media->get('field_media_image')->isEmpty()) {
        $files = $media->get('field_media_image');
        if ($files instanceof EntityReferenceFieldItemList) {
          $file = $files->referencedEntities()[0] ?? NULL;
          if ($file instanceof File) {
            return $file->createFileUrl(FALSE);
          }
        }
      }

      return NULL;
    })
    );

    $registry->addFieldResolver('AppPage', 'elements',
      $builder->produce('app_elements_producer')
        ->map('entity', $builder->fromParent())
    );
  }

}
