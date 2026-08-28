<?php

namespace Drupal\media_videotool\Plugin\media\Source;

use Drupal\Core\Entity\Display\EntityViewDisplayInterface;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\File\Exception\FileException;
use Drupal\Core\File\FileExists;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\media\MediaInterface;
use Drupal\media\MediaSourceBase;
use Drupal\media\MediaTypeInterface;
use Drupal\media_videotool\Traits\HasVideoToolFeaturesTrait;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\TransferException;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use function Safe\preg_match;

/**
 * Provides a media source plugin for VideoTool resources.
 *
 * @MediaSource(
 *   id = "videotool",
 *   label = @Translation("VideoTool"),
 *   description = @Translation("Embed VideoTool content."),
 *   allowed_field_types = {"string"},
 *   default_thumbnail_filename = "no-thumbnail.png",
 *   forms = {
 *     "media_library_add" = "\Drupal\media_videotool\Form\VideoToolMediaLibraryAddForm",
 *   }
 * )
 */
class VideoTool extends MediaSourceBase {

  use HasVideoToolFeaturesTrait;

  /**
   * Key for "Name" metadata attribute.
   *
   * @var string
   */
  private const METADATA_ATTRIBUTE_NAME = 'og:title';

  /**
   * Key for "Description" metadata attribute.
   *
   * @var string
   */
  private const METADATA_ATTRIBUTE_DESCRIPTION = 'og:description';

  /**
   * Key for "URL" metadata attribute.
   *
   * @var string
   */
  public const METADATA_ATTRIBUTE_URL = 'og:url';

  /**
   * Key for "Image" metadata attribute.
   *
   * @var string
   */
  private const METADATA_ATTRIBUTE_IMAGE = 'og:image';

  /**
   * Key for "type" metadata attribute.
   *
   * @var string
   */
  private const METADATA_ATTRIBUTE_TYPE = 'og:type';

  /**
   * Seconds to wait for a connection to VideoTool.
   *
   * @var int
   */
  private const REQUEST_CONNECT_TIMEOUT = 5;

  /**
   * Seconds to wait for a whole VideoTool request to finish.
   *
   * Media entities are saved synchronously - by an editor, or by a content
   * import - and every save asks the source plugin for metadata. Guzzle does
   * not time out by default, and the plain stream read this replaced waited
   * for PHP's default_socket_timeout of 60 seconds, so a slow VideoTool could
   * stall a save indefinitely. Nothing here is worth blocking a save on for
   * longer than a few seconds.
   *
   * @var int
   */
  private const REQUEST_TIMEOUT = 10;

  /**
   * Metadata parsed from VideoTool, keyed by media URL.
   *
   * Drupal calls getMetadata() once per attribute, so a single media save
   * asks for the name, the thumbnail and more. Without this, each of those
   * would be a separate request for the same document - and a separate
   * timeout to wait through when VideoTool is unreachable.
   *
   * @var array<string, array<string, string>>
   */
  protected array $metaDataCache = [];

  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    EntityTypeManagerInterface $entity_type_manager,
    EntityFieldManagerInterface $entity_field_manager,
    $field_type_manager,
    $config_factory,
    protected ClientInterface $httpClient,
    protected FileSystemInterface $fileSystem,
    protected LoggerInterface $logger,
  ) {
    parent::__construct(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $entity_type_manager,
      $entity_field_manager,
      $field_type_manager,
      $config_factory
    );
  }

  /**
   * {@inheritdoc}
   */
  public static function create(
    ContainerInterface $container,
    array $configuration,
    $plugin_id,
    $plugin_definition,
  ) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('entity_type.manager'),
      $container->get('entity_field.manager'),
      $container->get('plugin.manager.field.field_type'),
      $container->get('config.factory'),
      $container->get('http_client'),
      $container->get('file_system'),
      $container->get('logger.factory')->get('media'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getMetadataAttributes(): array {
    return [
      self::METADATA_ATTRIBUTE_NAME => $this->t('Name'),
      self::METADATA_ATTRIBUTE_DESCRIPTION => $this->t('Description'),
      self::METADATA_ATTRIBUTE_URL => $this->t('Url'),
      self::METADATA_ATTRIBUTE_IMAGE => $this->t('Image'),
      self::METADATA_ATTRIBUTE_TYPE => $this->t('Media type'),
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getMetadata(MediaInterface $media, $attribute_name) {

    $media_url = $this->getSourceFieldValue($media);
    // The URL may be NULL if the source field is empty, in which case just
    // return NULL.
    if (empty($media_url)) {
      return NULL;
    }

    if (!self::isValidVideoToolUrl($media_url)) {
      return NULL;
    }

    $metaData = $this->fetchMetaData($media_url);

    if (!$metaData) {
      return NULL;
    }

    $remote_thumbnail_url = $metaData[self::METADATA_ATTRIBUTE_IMAGE] ?? NULL;

    // Every attribute below is optional: VideoTool may answer with a document
    // that carries only some of the og: tags, and a missing tag must not be
    // worse than an unreachable host.
    return match ($attribute_name) {
      self::METADATA_ATTRIBUTE_NAME, 'default_name' => $metaData[self::METADATA_ATTRIBUTE_NAME] ?? NULL,
      self::METADATA_ATTRIBUTE_DESCRIPTION => $metaData[self::METADATA_ATTRIBUTE_DESCRIPTION] ?? NULL,
      self::METADATA_ATTRIBUTE_URL => $metaData[self::METADATA_ATTRIBUTE_URL] ?? NULL,
      self::METADATA_ATTRIBUTE_IMAGE, 'thumbnail_uri' => $remote_thumbnail_url ? $this->getLocalThumbnailUri($media_url, $remote_thumbnail_url) : NULL,
      self::METADATA_ATTRIBUTE_TYPE => $metaData[self::METADATA_ATTRIBUTE_TYPE] ?? NULL,
      default => parent::getMetadata($media, $attribute_name),
    };
  }

  /**
   * Fetches the og: meta tags VideoTool exposes for a video.
   *
   * @param string $media_url
   *   VideoTool media URL.
   *
   * @return array<string, string>
   *   The og: properties keyed by property name, or an empty array if
   *   VideoTool could not be reached or returned nothing we could parse.
   */
  protected function fetchMetaData(string $media_url): array {
    if (array_key_exists($media_url, $this->metaDataCache)) {
      return $this->metaDataCache[$media_url];
    }

    try {
      $response = $this->httpClient->request('GET', $media_url, [
        'connect_timeout' => self::REQUEST_CONNECT_TIMEOUT,
        'timeout' => self::REQUEST_TIMEOUT,
      ]);
    }
    catch (TransferException $e) {
      // A video host that is down, slow or answering with an error must not
      // fail the save of the media entity referencing it. Without metadata the
      // media keeps its stored name and falls back to the default thumbnail,
      // and a later save picks the metadata up once VideoTool answers again.
      $this->logger->warning('Could not fetch VideoTool metadata from {url}: {message}', [
        'url' => $media_url,
        'message' => $e->getMessage(),
      ]);

      $this->metaDataCache[$media_url] = [];

      return $this->metaDataCache[$media_url];
    }

    $doc = new \DOMDocument();
    @$doc->loadHTML((string) $response->getBody());
    $metaTags = $doc->getElementsByTagName('meta');

    $metaData = [];
    foreach ($metaTags as $metaTag) {
      if ($metaTag->hasAttribute('property') && $metaTag->hasAttribute('content')) {
        $metaData[$metaTag->getAttribute('property')] = $metaTag->getAttribute('content');
      }
    }

    $this->metaDataCache[$media_url] = $metaData;

    return $this->metaDataCache[$media_url];
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state): array {
    $form = parent::buildConfigurationForm($form, $form_state);
    $form['generate_thumbnails'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Generate thumbnails'),
      '#default_value' => $this->configuration['generate_thumbnails'],
      '#description' => $this->t('If checked, Drupal will automatically generate thumbnails from VideoTool provided images.'),
    ];
    return $form;
  }

  /**
   * Retrieve a thumbnail for a VideoTool resource.
   *
   * @param string $media_url
   *   VideoTool media URL.
   * @param string $remote_thumbnail_url
   *   Thumbnail url returned from VideoTool og:image meta tag.
   *
   * @return string|null
   *   Either the URL of a local thumbnail, or NULL.
   */
  protected function getLocalThumbnailUri(string $media_url, string $remote_thumbnail_url): ?string {

    // Compute the local thumbnail URI, regardless of whether it exists.
    $directory = $this->configuration['thumbnails_directory'];
    preg_match('/\?vn=(.*)/', $media_url, $matches);
    if (!isset($matches[1])) {
      return NULL;
    }
    $local_thumbnail_uri = "$directory/" . $matches[1] . '.jpg';

    // If the local thumbnail already exists, return its URI.
    if (file_exists($local_thumbnail_uri)) {
      return $local_thumbnail_uri;
    }

    // The local thumbnail doesn't exist yet, so try to download it. First,
    // ensure that the destination directory is writable, and if it's not,
    // log an error and bail out.
    if (!$this->fileSystem->prepareDirectory($directory, FileSystemInterface::CREATE_DIRECTORY | FileSystemInterface::MODIFY_PERMISSIONS)) {
      $this->logger->warning('Could not prepare thumbnail destination directory @dir for VideoTool media.', [
        '@dir' => $directory,
      ]);
      return NULL;
    }

    try {
      // Same timeouts as the metadata request, and the same reasoning: the
      // thumbnail is not worth stalling a save for. Catching TransferException
      // rather than RequestException also covers the connect failures that a
      // down host produces, which are not RequestExceptions in Guzzle 7.
      $response = $this->httpClient->request('GET', $remote_thumbnail_url, [
        'connect_timeout' => self::REQUEST_CONNECT_TIMEOUT,
        'timeout' => self::REQUEST_TIMEOUT,
      ]);
      if ($response->getStatusCode() === 200) {
        $this->fileSystem->saveData((string) $response->getBody(), $local_thumbnail_uri, FileExists::Replace);

        return $local_thumbnail_uri;
      }
    }
    catch (TransferException $e) {
      $this->logger->warning($e->getMessage());
    }
    catch (FileException $e) {
      $this->logger->warning('Could not download remote thumbnail from {url}.', [
        'url' => $remote_thumbnail_url,
      ]);
    }
    return NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration(): array {
    return [
      'thumbnails_directory' => 'public://videotool_thumbnails',
      'height' => '',
      'width' => '',
      'generate_thumbnails' => TRUE,
    ] + parent::defaultConfiguration();
  }

  /**
   * {@inheritdoc}
   */
  public function prepareViewDisplay(MediaTypeInterface $type, EntityViewDisplayInterface $display): void {
    $sourceField = $this->getSourceFieldDefinition($type);

    if ($sourceField instanceof FieldDefinitionInterface) {
      $sourceField->getDescription();
      $display->setComponent($sourceField->getName(), [
        'type' => 'media_videotool_embed',
        'label' => 'visually_hidden',
      ]);
    }
  }

}
