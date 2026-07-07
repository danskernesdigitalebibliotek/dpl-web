<?php

declare(strict_types=1);

namespace Drupal\dpl_app\Plugin\GraphQL\DataProducer;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Field\EntityReferenceFieldItemList;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_media\Entity\VideotoolBase;
use Drupal\dpl_paragraphs\Entity\GoVideoBundleAutomaticBase;
use Drupal\dpl_paragraphs\Entity\GoVideoBundleManualBase;
use Drupal\dpl_paragraphs\Entity\RecommendationParagraph;
use Drupal\dpl_paragraphs\Entity\TextBodyParagraph;
use Drupal\dpl_paragraphs\Entity\VideoParagraph;
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
   * TTL for streaming URLs.
   *
   * Streaming URLs are only valid for a requested time (minimum one minute,
   * maximum 31 days). We'll go with 24 hours, should leave enough time for
   * the app.
   *
   * @var int
   */
  protected int $ttl = 86400;

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
      if ($paragraph instanceof TextBodyParagraph) {
        $result[] = $this->handleTextBody($paragraph, $field_context);
      }
      elseif ($paragraph instanceof VideoParagraph) {
        $res = $this->handleVideo($paragraph, $field_context);
        if ($res) {
          $result[] = $res;
        }
      }
      elseif ($paragraph instanceof GoVideoBundleManualBase) {
        $res = $this->handleGoVideoBundleManual($paragraph, $field_context);
        if ($res) {
          $result[] = $res;
        }
      }
      elseif ($paragraph instanceof GoVideoBundleAutomaticBase) {
        $res = $this->handleGoVideoBundleAutomatic($paragraph, $field_context);
        if ($res) {
          $result[] = $res;
        }
      }
      elseif ($paragraph instanceof RecommendationParagraph) {
        $res = $this->handleRecommendation($paragraph, $field_context);
        if ($res) {
          $result[] = $res;
        }
      }
      elseif ($paragraph->bundle() == 'nav_spots_manual') {
        $field = $paragraph->get('field_nav_spots_content');
        if ($field instanceof EntityReferenceFieldItemList) {
          $field_context->addCacheableDependency($paragraph);
          $linkedPages = [];

          foreach ($field->referencedEntities() as $entity) {
            $linkedPages[] = $entity->uuid();
          }
          $result[] = [
            '__typename' => 'AppContentElementNavSpotsManual',
            'id' => $paragraph->uuid(),
            'linkedPages' => $linkedPages,
          ];
        }
      }
      elseif ($paragraph->bundle() == 'go_material_slider_automatic') {
        $cql = $paragraph->get('field_cql_search')->value;
        if ($cql) {
          $field_context->addCacheableDependency($paragraph);

          $result[] = [
            '__typename' => 'AppContentElementGoMaterialSliderAutomatic',
            'id' => $paragraph->uuid(),
            'title' => $paragraph->get('field_title')->value,
            'cql' => $cql,
            'limit' => (int) $paragraph->get('field_slider_amount_of_materials')->value,
          ];
        }
      }
      elseif ($paragraph->bundle() == 'go_material_slider_manual') {
        $workIds = [];
        foreach ($paragraph->get('field_material_slider_work_ids') as $item) {
          // @phpstan-ignore property.notFound (magic property)
          if ($item->value) {
            $workIds[] = $item->value;
          }
        }

        if (!empty($workIds)) {
          $field_context->addCacheableDependency($paragraph);

          $result[] = [
            '__typename' => 'AppContentElementGoMaterialSliderManual',
            'id' => $paragraph->uuid(),
            'title' => $paragraph->get('field_title')->value,
            'workIds' => $workIds,
          ];
        }
      }
      elseif ($paragraph->bundle() == 'material_grid_automatic') {
        $cql = $paragraph->get('field_cql_search')->value;
        if ($cql) {
          $field_context->addCacheableDependency($paragraph);

          $result[] = [
            '__typename' => 'AppContentElementMaterialGridAutomatic',
            'id' => $paragraph->uuid(),
            'title' => $paragraph->get('field_material_grid_title')->value,
            'description' => $paragraph->get('field_material_grid_description')->value,
            'cql' => $cql,
            'limit' => (int) $paragraph->get('field_material_amount')->value,
            'priorityMaterialType' => $paragraph->get('field_priority_material_type')->value,
          ];
        }
      }
      elseif ($paragraph->bundle() == 'material_grid_manual') {
        $workIds = [];
        foreach ($paragraph->get('field_material_grid_work_ids') as $item) {
          // @phpstan-ignore property.notFound (magic property)
          if ($item->value) {
            $workIds[] = $item->value;
          }
        }

        if (!empty($workIds)) {
          $field_context->addCacheableDependency($paragraph);

          $result[] = [
            '__typename' => 'AppContentElementMaterialGridManual',
            'id' => $paragraph->uuid(),
            'title' => $paragraph->get('field_material_grid_title')->value,
            'description' => $paragraph->get('field_material_grid_description')->value,
            'workIds' => $workIds,
          ];
        }
      }
    }

    return $result;
  }

  /**
   * Handle text_body paragraph.
   *
   * @return array<mixed>
   *   GraphQL data.
   */
  protected function handleTextBody(TextBodyParagraph $paragraph, FieldContext $field_context): array {
    // @todo resolve() should handle adding the paragraph.
    $field_context->addCacheableDependency($paragraph);

    return [
      '__typename' => 'AppContentElementText',
      'id' => $paragraph->uuid(),
      'body' => $paragraph->getBody(),
    ];
  }

  /**
   * Handle video paragraph.
   *
   * @return array<mixed>
   *   GraphQL data.
   */
  protected function handleVideo(VideoParagraph $paragraph, FieldContext $field_context): ?array {
    $media = $paragraph->getVideoMedia();

    if (!$media instanceof VideotoolBase) {
      return NULL;
    }

    $video = $this->handleVideoElement($media, $field_context);

    if (!$video) {
      return NULL;
    }

    return [
      '__typename' => 'AppContentElementVideo',
      'id' => $paragraph->uuid(),
      'title' => $media->getThumbnail,
      'video' => $video,
    ];
  }

  /**
   * Handle go_video_bundle paragraphs.
   *
   * @return array<mixed>
   *   GraphQL data.
   */
  protected function handleGoVideoBundleManual(GoVideoBundleManualBase $paragraph, FieldContext $field_context): ?array {
    $media = $paragraph->getVideoMedia();

    if (!$media instanceof VideotoolBase) {
      return NULL;
    }

    $video = $this->handleVideoElement($media, $field_context);

    if (!$video) {
      return NULL;
    }

    return [
      '__typename' => 'AppContentElementVideoBundleManual',
      'id' => $paragraph->uuid(),
      'title' => $paragraph->getVideoTitle(),
      'workIds' => $paragraph->getWorkIds(),
      'video' => $video,
    ];
  }

  /**
   * Handle automatic go_video_bundle paragraphs.
   *
   * @return array<mixed>
   *   GraphQL data.
   */
  protected function handleGoVideoBundleAutomatic(GoVideoBundleAutomaticBase $paragraph, FieldContext $field_context): ?array {
    $media = $paragraph->getVideoMedia();

    if (!$media instanceof VideotoolBase) {
      return NULL;
    }

    $video = $this->handleVideoElement($media, $field_context);

    if (!$video) {
      return NULL;
    }

    $field_context->addCacheableDependency($paragraph);

    return [
      '__typename' => 'AppContentElementVideoBundleAutomatic',
      'id' => $paragraph->uuid(),
      'title' => $paragraph->getVideoTitle(),
      'cql' => $paragraph->getCql(),
      'limit' => $paragraph->getLimit(),
      'video' => $video,
    ];
  }

  /**
   * Handle recommendation paragraphs.
   *
   * @return array<mixed>|null
   *   GraphQL data.
   */
  protected function handleRecommendation(RecommendationParagraph $paragraph, FieldContext $field_context): ?array {
    $workId = $paragraph->getWorkId();

    // A recommendation without a material doesn't make much sense, but the
    // field isn't required.
    if (!$workId) {
      return NULL;
    }

    $field_context->addCacheableDependency($paragraph);

    return [
      '__typename' => 'AppContentElementRecommendation',
      'id' => $paragraph->uuid(),
      'imagePositionRight' => $paragraph->isImagePositionRight(),
      'title' => $paragraph->getRecommendationTitle(),
      'description' => $paragraph->getDescription(),
      'workId' => $workId,
    ];
  }

  /**
   * Get the url and thumbnail of a video referenced.
   *
   * @param \Drupal\dpl_media\Entity\VideotoolBase $media
   *   Paragraph to extract from.
   * @param \Drupal\graphql\GraphQL\Execution\FieldContext $field_context
   *   The field context for adding cache metadata.
   *
   * @return array{url: string, thumbnail: string}|null
   *   Stream URL and thumbnail.
   */
  protected function handleVideoElement(VideotoolBase $media, FieldContext $field_context): ?array {
    $field_context->addCacheableDependency($media);

    if (!$media instanceof VideotoolBase) {
      return NULL;
    }

    $thumbnail = $media->getThumbnail();
    if (!$thumbnail->getFileUri()) {
      return NULL;
    }

    $field_context->addCacheableDependency($thumbnail);

    $url = $this->videoTool->getVideoStreamUrl($media->getVideotoolUrl(), $this->ttl);

    if (!$url) {
      return NULL;
    }

    return [
      'url' => $url,
      'thumbnail' => $this->fileUrlGenerator->generateAbsoluteString($thumbnail->getFileUri()),
    ];
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
   * @param \Drupal\graphql\GraphQL\Execution\FieldContext $field_context
   *   The field context for adding cache metadata.
   *
   * @return array{url: string, thumbnail: string}|null
   *   Stream URL and thumbnail.
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

    foreach ($fieldNames as $fieldName) {
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
    $thumbnailFileUri = $thumbnailFile?->getFileUri();

    if (!$thumbnailFileUri) {
      return NULL;
    }

    $thumbnail = $this->fileUrlGenerator->generateAbsoluteString($thumbnailFileUri);

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
    $field_context->addCacheableDependency($thumbnailFile);

    return ['url' => $url, 'thumbnail' => $thumbnail];
  }

}
