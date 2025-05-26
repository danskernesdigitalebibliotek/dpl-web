<?php

namespace Drupal\bnf\Plugin\Traits;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files\MediaDocument;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileExists;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\FileInterface;
use Drupal\file\FileRepositoryInterface;
use Drupal\media\Entity\Media;
use Spawnia\Sailor\ObjectLike;
use function Safe\file_get_contents;
use function Safe\parse_url;

/**
 * Helper trait, for dealing with file fields.
 *
 * Notice - this is also used by the ImageTrait, to create the image files.
 */
trait FileTrait {
  use AutowirePluginTrait;
  /**
   * The entity type manager.
   */
  protected EntityTypeManagerInterface $entityTypeManager;
  /**
   * File system manager.
   */
  protected FileSystemInterface $fileSystem;

  /**
   * File repository.
   */
  protected FileRepositoryInterface $fileRepository;

  /**
   * Downloading and creating a file from an external file URL.
   */
  public function createFile(string $url): FileInterface {
    $parsed_url = parse_url($url, PHP_URL_PATH);

    if (!is_string($parsed_url) || !filter_var($url, FILTER_VALIDATE_URL)) {
      throw new \Exception("Invalid file URL: $url");
    }

    // Prepare the destination directory.
    $directory = 'public://imported-bnf-files/';

    if (!$this->fileSystem->prepareDirectory($directory, FileSystemInterface::CREATE_DIRECTORY)) {
      throw new \Exception("Failed to create directory: $directory");
    }

    // Determine the destination path.
    $filename = basename($parsed_url);
    $destination = $directory . $filename;

    // Download the file data.
    $data = file_get_contents($url);
    if (empty($data)) {
      throw new \Exception('Failed to download file.');
    }

    // Save the file using the file.repository service.
    // If the file name already exists, we replace it. This is to avoid the disk
    // getting filled up with copies of the same file.
    // The filename consists of the URL of the original site, so this should
    // be specific enough that it won't replace.
    return $this->fileRepository->writeData($data, $destination, FileExists::Replace);
  }

  /**
   * Getting Drupal-ready value from object.
   *
   * @return mixed[]
   *   The value that can be used with Drupal ->set().
   */
  public function getMediaDocumentValue(MediaDocument|ObjectLike|null $document): array {
    if (is_null($document)) {
      return [];
    }

    /** @var \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files\MediaDocument $document */
    $file = $this->createFile($document->mediaFile->url);

    $mediaStorage = $this->entityTypeManager->getStorage('media');

    $properties = [
      'bundle' => 'document',
      'status' => TRUE,
      'field_media_file' => [
        'target_id' => $file->id(),
        'display' => TRUE,
      ],
      'name' => $document->mediaFile->name,
    ];

    if (!empty($document->mediaFile->description)) {
      $properties['field_media_file']['description'] = $document->mediaFile->description;
    }

    // Look up existing media - if it exists, referer to that, otherwise create.
    $medias = $mediaStorage->loadByProperties($properties);
    $media = reset($medias);

    if (!($media instanceof Media)) {
      $media = $mediaStorage->create($properties);
      $media->save();
    }

    return ['target_id' => $media->id()];
  }

}
