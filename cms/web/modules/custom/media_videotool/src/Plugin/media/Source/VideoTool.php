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
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\RequestException;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use function Safe\file_get_contents;
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

  /**
   * Key for "Name" metadata attribute.
   *
   * @var string
   */
  const METADATA_ATTRIBUTE_NAME = 'og:title';

  /**
   * Key for "Description" metadata attribute.
   *
   * @var string
   */
  const METADATA_ATTRIBUTE_DESCRIPTION = 'og:description';

  /**
   * Key for "URL" metadata attribute.
   *
   * @var string
   */
  const METADATA_ATTRIBUTE_URL = 'og:url';

  /**
   * Key for "Image" metadata attribute.
   *
   * @var string
   */
  const METADATA_ATTRIBUTE_IMAGE = 'og:image';

  /**
   * Key for "type" metadata attribute.
   *
   * @var string
   */
  const METADATA_ATTRIBUTE_TYPE = 'og:type';

  /**
   * The file system.
   *
   * @var \Drupal\Core\File\FileSystemInterface
   */
  protected FileSystemInterface $fileSystem;

  /**
   * The HTTP client.
   *
   * @var \GuzzleHttp\ClientInterface
   */
  protected ClientInterface $httpClient;

  /**
   * The logger channel for media.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected LoggerInterface $logger;

  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    EntityTypeManagerInterface $entity_type_manager,
    EntityFieldManagerInterface $entity_field_manager,
    $field_type_manager,
    $config_factory,
    ClientInterface $http_client,
    FileSystemInterface $file_system,
    LoggerInterface $logger,
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

    $this->fileSystem = $file_system;
    $this->httpClient = $http_client;
    $this->logger = $logger;
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
      static::METADATA_ATTRIBUTE_NAME => $this->t('Name'),
      static::METADATA_ATTRIBUTE_DESCRIPTION => $this->t('Description'),
      static::METADATA_ATTRIBUTE_URL => $this->t('Url'),
      static::METADATA_ATTRIBUTE_IMAGE => $this->t('Image'),
      static::METADATA_ATTRIBUTE_TYPE => $this->t('Media type'),
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

    if (!preg_match("(https:\/\/media\.videotool\.dk\/\?vn=([a-z0-9]{3})_([a-z0-9]{28}))", $media_url, $matches)) {
      return NULL;
    }

    $doc = new \DOMDocument();
    @$doc->loadHTML(file_get_contents($media_url));
    $metaTags = $doc->getElementsByTagName('meta');

    $metaData = [];
    foreach ($metaTags as $metaTag) {
      if ($metaTag->hasAttribute('property') && $metaTag->hasAttribute('content')) {
        $metaData[$metaTag->getAttribute('property')] = $metaTag->getAttribute('content');
      }
    }

    if (!$metaData) {
      return NULL;
    }

    return match ($attribute_name) {
      'default_name', static::METADATA_ATTRIBUTE_NAME => $metaData['og:title'],
      static::METADATA_ATTRIBUTE_DESCRIPTION => $metaData['og:description'],
      static::METADATA_ATTRIBUTE_URL => $metaData['og:url'],
      static::METADATA_ATTRIBUTE_IMAGE, 'thumbnail_uri' => $this->getLocalThumbnailUri($media_url, $metaData['og:image']),
      static::METADATA_ATTRIBUTE_TYPE => $metaData['og:type'],
      default => parent::getMetadata($media, $attribute_name),
    };
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
      $response = $this->httpClient->request('GET', $remote_thumbnail_url);
      if ($response->getStatusCode() === 200) {
        $this->fileSystem->saveData((string) $response->getBody(), $local_thumbnail_uri, FileExists::Replace);

        return $local_thumbnail_uri;
      }
    }
    catch (RequestException $e) {
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
