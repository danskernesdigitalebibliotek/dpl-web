<?php

declare(strict_types=1);

namespace Drupal\dpl_app\Plugin\GraphQL\DataProducer;

use Drupal\Core\DependencyInjection\AutowiredInstanceTrait;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\Execution\FieldContext;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\media_videotool\VideoTool;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Produces the stream URL of a Videotool video.
 *
 * @DataProducer(
 *   id = "dpl_app_stream_url",
 *   name = "Stream URL producer",
 *   description = "Produces the stream URL of a Videotool video.",
 *   produces = @ContextDefinition("any",
 *     label = "Streaming URL"
 *   ),
 *   consumes = {
 *     "media" = @ContextDefinition("entity",
 *       label = @Translation("Videotool media"),
 *     ),
 *   }
 * )
 */
class StreamUrlProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  use AutowiredInstanceTrait;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    protected VideoTool $videoTool,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  /**
   * Instantiates the plugin using autowiring.
   *
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   *   The container to pull out services used in the plugin.
   * @param mixed[] $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   *
   * @return static
   *   Returns an instance of this plugin.
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return static::createInstanceAutowired($container, $configuration, $plugin_id, $plugin_definition);
  }

  /**
   * Provide the response to the `newContent` query.
   */
  public function resolve(ContentEntityInterface $media, FieldContext $fieldContext): ?string {
    // Streaming URLs are only valid for a requested time (minimum one minute,
    // maximum 31 days). We'll go with 24 hours, should leave enough time for
    // the app.
    $ttl = 86400;
    $fieldContext->mergeCacheMaxAge($ttl / 2);
    $url = NULL;
    if ($media->hasField('field_media_videotool')) {
      $url = $media->get('field_media_videotool')->value;
    }
    elseif ($media->hasField('field_media_videotool_vertical')) {
      $url = $media->get('field_media_videotool_vertical')->value;
    }

    if (!$url) {
      return NULL;
    }

    return $this->videoTool->getVideoStreamUrl($url, $ttl);
  }

}
