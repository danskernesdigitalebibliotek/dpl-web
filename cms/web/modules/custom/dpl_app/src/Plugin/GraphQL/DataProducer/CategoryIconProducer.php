<?php

declare(strict_types=1);

namespace Drupal\dpl_app\Plugin\GraphQL\DataProducer;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Field\EntityReferenceFieldItemList;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\file\Entity\File;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;

/**
 * Resolves app categories.
 *
 * @DataProducer(
 *   id = "app_category_icon_producer",
 *   name = "Category Icon Producer",
 *   description = "Provides category image app.",
 *   produces = @ContextDefinition("string",
 *     label = "ImageUrl"
 *   ),
 *   consumes = {
 *     "entity" = @ContextDefinition("any",
 *       label = "Entity to get icon for"
 *     )
 *   }
 * )
 */
class CategoryIconProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  use AutowirePluginTrait;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected EntityTypeManagerInterface $entititypeManager,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * Resolves the icon.
   *
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   *   The node to get icon from.
   * @param \Drupal\graphql\GraphQL\Execution\FieldContext $field_context
   *   The field context for adding cache metadata.
   *
   * @return string
   *   The icon URL.
   */
  public function resolve(
    ContentEntityInterface $entity,
    FieldContext $field_context,
  ): string {
    $field_context->addCacheableDependency($entity);
    /** @var \Drupal\media\Entity\Media|null $media */
    $media = NULL;

    if ($entity->hasField('field_category_menu_image')) {
      // Applies to go_category.
      $medias = $entity->get('field_category_menu_image');
      if ($medias instanceof EntityReferenceFieldItemList) {
        /** @var \Drupal\media\Entity\Media $media */
        $media = $medias->referencedEntities()[0];
      }
    }
    elseif ($entity->hasField('field_teaser_image')) {
      // Applies to article and page.
      $medias = $entity->get('field_teaser_image');
      if ($medias instanceof EntityReferenceFieldItemList) {
        /** @var \Drupal\media\Entity\Media $media */
        $media = $medias->referencedEntities()[0];
      }
    }

    /** @var \Drupal\file\Entity\File|null $file */
    $file = NULL;

    if ($media && $media->hasField('field_media_image')) {
      $field_context->addCacheableDependency($media);

      $files = $media->get('field_media_image');

      if ($files instanceof EntityReferenceFieldItemList) {
        $file = $files->referencedEntities()[0];
      }
    }

    if ($file instanceof File) {
      $field_context->addCacheableDependency($file);
      return $file->createFileUrl(FALSE);
    }

    return '';
  }

}
