<?php

declare(strict_types=1);

namespace Drupal\dpl_app\Plugin\GraphQL\DataProducer;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Field\EntityReferenceFieldItemList;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\media\Entity\Media;
use Drupal\media_videotool\VideoTool;

/**
 * Resolves paragraphs to app elements.
 *
 * @DataProducer(
 *   id = "app_elements_producer",
 *   name = "App elements Producer",
 *   description = "Provides elements for the app.",
 *   produces = @ContextDefinition("any",
 *     label = "Array of elements"
 *   ),
 *   consumes = {
 *     "entity" = @ContextDefinition("any",
 *       label = "Entity to get icon for"
 *     )
 *   }
 * )
 */
class ElementsProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  use AutowirePluginTrait;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected VideoTool $videoTool,
    protected FileUrlGeneratorInterface $fileUrlGenerator,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * Resolves the elements.
   *
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   *   The node to elements from.
   * @param \Drupal\graphql\GraphQL\Execution\FieldContext $field_context
   *   The field context for adding cache metadata.
   *
   * @return array<mixed>
   *   App elements.
   */
  public function resolve(
    ContentEntityInterface $entity,
    FieldContext $field_context,
  ): array {
    $result = [];
    if (!$entity->hasField('field_paragraphs')) {
      return $result;
    }

    $paragraphs = $entity->get('field_paragraphs');

    if (!$paragraphs instanceof EntityReferenceFieldItemList) {
      return $result;
    }

    $field_context->addCacheableDependency($entity);

    /** @var \Drupal\Core\Entity\ContentEntityInterface $paragraph */
    foreach ($paragraphs->referencedEntities() as $paragraph) {
      // This is very naive implementation that'll become unwieldy when we've
      // added a few more paragraph types, but it'll do for the first take.
      // It would be nice to decouple the knowledge about the individual
      // paragraphs from this class, but how the paragraph maps to the app
      // element is coupled to the type we define in
      // dpl_app_categories.base.graphqls, and it would be nice if they where
      // near each other.
      if ($paragraph->bundle() == 'text_body') {
        $field_context->addCacheableDependency($paragraph);

        $result[] = [
          '__type' => 'AppContentElementText',
          'id' => $paragraph->uuid(),
          'body' => $paragraph->get('field_body')->value,
        ];
      }
      elseif ($paragraph->bundle() == 'video') {

        $video = $this->extractVideo($paragraph, ['field_embed_video'], $field_context);
        if ($video) {
          $field_context->addCacheableDependency($paragraph);
          $result[] = [
            '__type' => 'AppContentElementVideo',
            'id' => $paragraph->uuid(),
            'title' => NULL,
            'video' => $video,
          ];
        }
      }
    }

    return $result;
  }

  /**
   * Get the url and thumbnail of a video referenced.
   *
   * This should not be here. It knows way too much about the structure of
   * paragraphs and media. But the app needs data ASAP.
   *
   * @param \Drupal\Core\Entity\ContentEntityInterface $paragraph
   *   Paragraph to extract from.
   * @param string[] $fieldNames
   *   Field names to try.
   *
   * @return array{url: string, thumbnail: string}|null
   */
  protected function extractVideo(
    ContentEntityInterface $paragraph,
    array $fieldNames,
    FieldContext $field_context,
  ): ?array {
    $media = NULL;
    $thumbnail = NULL;
    // Streaming URLs are only valid for a requested time (minimum one minute,
    // maximum 31 days). We'll go with 24 hours, should leave enough time for
    // the app.
    $ttl = 86400;

    foreach ($fieldNames as $fieldName){
      $field = $paragraph->get($fieldName);

      if ($field instanceof EntityReferenceFieldItemList) {
        /** @var \Drupal\media\Entity\Media $media */
        $media = $field->referencedEntities()[0];
      }
    }

    if (!$media instanceof Media) {
      return NULL;
    }

    /** @var \Drupal\file\Entity\File|null $thumbnailFile */
    $thumbnailFile = $media->get('thumbnail')->entity;

    if (!$thumbnailFile) {
      return NULL;
    }

    $thumbnail = $this->fileUrlGenerator->generateAbsoluteString($thumbnailFile->getFileUri());

    $videotoolFields = [
      'field_media_videotool',
      'field_media_videotool_vertical',
    ];
    foreach ($videotoolFields as $videotoolField) {
      if ($media->hasField($videotoolField)) {

        $url = $media->get($videotoolField)->value;

        if ($url) {
          $url = $this->videoTool->getVideoStreamUrl($url, $ttl);
        }

        break;
      }
    }

    if (empty($url) || empty($thumbnail)) {
      return NULL;
    }

    $field_context->addCacheableDependency($media);
    $field_context->addCacheableDependency($thumbnail);

    return ['url' => $url, 'thumbnail' => $thumbnail];
  }

}
