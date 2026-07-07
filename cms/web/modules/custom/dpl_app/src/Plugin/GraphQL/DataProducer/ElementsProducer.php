<?php

declare(strict_types=1);

namespace Drupal\dpl_app\Plugin\GraphQL\DataProducer;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Field\EntityReferenceFieldItemList;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dpl_media\Entity\VideotoolBase;
use Drupal\dpl_paragraphs\Entity\GoMaterialSliderAutomaticParagraph;
use Drupal\dpl_paragraphs\Entity\GoMaterialSliderManualParagraph;
use Drupal\dpl_paragraphs\Entity\MaterialGridAutomaticParagraph;
use Drupal\dpl_paragraphs\Entity\MaterialGridManualParagraph;
use Drupal\dpl_paragraphs\Entity\GoVideoBundleAutomaticBase;
use Drupal\dpl_paragraphs\Entity\GoVideoBundleManualBase;
use Drupal\dpl_paragraphs\Entity\NavSpotsManualParagraph;
use Drupal\dpl_paragraphs\Entity\RecommendationParagraph;
use Drupal\dpl_paragraphs\Entity\TextBodyParagraph;
use Drupal\dpl_paragraphs\Entity\VideoParagraph;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
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
      $response = NULL;
      if ($paragraph instanceof TextBodyParagraph) {
        $response = $this->handleTextBody($paragraph, $field_context);
      }
      elseif ($paragraph instanceof VideoParagraph) {
        $response = $this->handleVideo($paragraph, $field_context);
      }
      elseif ($paragraph instanceof GoVideoBundleManualBase) {
        $response = $this->handleGoVideoBundleManual($paragraph, $field_context);
      }
      elseif ($paragraph instanceof GoVideoBundleAutomaticBase) {
        $response = $this->handleGoVideoBundleAutomatic($paragraph, $field_context);
      }
      elseif ($paragraph instanceof RecommendationParagraph) {
        $response = $this->handleRecommendation($paragraph, $field_context);
      }
      elseif ($paragraph instanceof NavSpotsManualParagraph) {
        $response = $this->handleNavSpotsManual($paragraph, $field_context);
      }
      elseif ($paragraph instanceof GoMaterialSliderAutomaticParagraph) {
        $response = $this->handleGoMaterialSliderAutomatic($paragraph, $field_context);
      }
      elseif ($paragraph instanceof GoMaterialSliderManualParagraph) {
        $response = $this->handleGoMaterialSliderManual($paragraph, $field_context);
      }
      elseif ($paragraph instanceof MaterialGridAutomaticParagraph) {
        $response = $this->handleMaterialGridAutomatic($paragraph, $field_context);
      }
      elseif ($paragraph instanceof MaterialGridManualParagraph) {
        $response = $this->handleMaterialGridManual($paragraph, $field_context);
      }

      if ($response) {
        $field_context->addCacheableDependency($paragraph);
        $result[] = $response;
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
   * Handle nav_spots_manual paragraphs.
   *
   * @return array<mixed>|null
   *   GraphQL data.
   */
  protected function handleNavSpotsManual(NavSpotsManualParagraph $paragraph, FieldContext $field_context): ?array {
    $linkedPages = $paragraph->getLinkedPageUuids();
    if (empty($linkedPages)) {
      return NULL;
    }

    return [
      '__typename' => 'AppContentElementNavSpotsManual',
      'id' => $paragraph->uuid(),
      'linkedPages' => $linkedPages,
    ];
  }

  /**
   * Handle go_material_slider_automatic paragraphs.
   *
   * @return array<mixed>|null
   *   GraphQL data.
   */
  protected function handleGoMaterialSliderAutomatic(GoMaterialSliderAutomaticParagraph $paragraph, FieldContext $field_context): ?array {
    $cql = $paragraph->getCql();
    if (!$cql) {
      return NULL;
    }

    return [
      '__typename' => 'AppContentElementGoMaterialSliderAutomatic',
      'id' => $paragraph->uuid(),
      'title' => $paragraph->getSliderTitle(),
      'cql' => $cql,
      'limit' => $paragraph->getLimit(),
    ];
  }

  /**
   * Handle go_material_slider_manual paragraphs.
   *
   * @return array<mixed>|null
   *   GraphQL data.
   */
  protected function handleGoMaterialSliderManual(GoMaterialSliderManualParagraph $paragraph, FieldContext $field_context): ?array {
    $workIds = $paragraph->getWorkIds();
    if (empty($workIds)) {
      return NULL;
    }

    return [
      '__typename' => 'AppContentElementGoMaterialSliderManual',
      'id' => $paragraph->uuid(),
      'title' => $paragraph->getSliderTitle(),
      'workIds' => $workIds,
    ];
  }

  /**
   * Handle material_grid_automatic paragraphs.
   *
   * @return array<mixed>|null
   *   GraphQL data.
   */
  protected function handleMaterialGridAutomatic(MaterialGridAutomaticParagraph $paragraph, FieldContext $field_context): ?array {
    $cql = $paragraph->getCql();
    if (!$cql) {
      return NULL;
    }

    return [
      '__typename' => 'AppContentElementMaterialGridAutomatic',
      'id' => $paragraph->uuid(),
      'title' => $paragraph->getGridTitle(),
      'description' => $paragraph->getGridDescription(),
      'cql' => $cql,
      'limit' => $paragraph->getLimit(),
      'priorityMaterialType' => $paragraph->getPriorityMaterialType(),
    ];
  }

  /**
   * Handle material_grid_manual paragraphs.
   *
   * @return array<mixed>|null
   *   GraphQL data.
   */
  protected function handleMaterialGridManual(MaterialGridManualParagraph $paragraph, FieldContext $field_context): ?array {
    $workIds = $paragraph->getWorkIds();
    if (empty($workIds)) {
      return NULL;
    }

    return [
      '__typename' => 'AppContentElementMaterialGridManual',
      'id' => $paragraph->uuid(),
      'title' => $paragraph->getGridTitle(),
      'description' => $paragraph->getGridDescription(),
      'workIds' => $workIds,
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

    $thumbnail = $media->getThumbnail();
    if (!$thumbnail || !$thumbnail->getFileUri()) {
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

}
