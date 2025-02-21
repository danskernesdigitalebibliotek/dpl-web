<?php

namespace Drupal\bnf\Plugin\FieldTypeTraits;

use Drupal\autowire_plugin_trait\AutowirePluginTrait;
use Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files\MediaDocument;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileExists;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\FileInterface;
use Drupal\file\FileRepositoryInterface;
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

  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected FileSystemInterface $fileSystem,
    protected FileRepositoryInterface $fileRepository,
  ) {
  }

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
    return $this->fileRepository->writeData($data, $destination, FileExists::Rename);
  }

  /**
   * Getting Drupal-ready value from object.
   *
   * @return mixed[]
   *   The value that can be used with Drupal ->set().
   */
  public function getFileValue(MediaDocument|ObjectLike|null $document): array {
    if (is_null($document)) {
      return [];
    }

    /** @var \Drupal\bnf\GraphQL\Operations\GetNode\Node\Paragraphs\Files\MediaDocument $document */
    $file = $this->createFile($document->mediaFile->url);

    $mediaStorage = $this->entityTypeManager->getStorage('media');

    // Create the media entity.
    $media = $mediaStorage->create([
      'bundle' => 'document',

      'status' => TRUE,
      'field_media_file' => [
        'target_id' => $file->id(),
        'display' => TRUE,
        'description' => $document->mediaFile->description,
      ],
      'name' => $document->mediaFile->name,

    ]);
    $media->save();

    return ['target_id' => $media->id()];
  }

}
