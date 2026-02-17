<?php

namespace Drupal\dpl_react_apps\Services;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\file\FileInterface;
use Drupal\image\ImageStyleInterface;
use Drupal\media\MediaInterface;
use Drupal\node\NodeInterface;

/**
 * Service for building branch list data for the React branch-list app.
 */
class BranchListService {

  /**
   * Constructor.
   */
  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected FileUrlGeneratorInterface $fileUrlGenerator,
  ) {}

  /**
   * Get branch list data for the React app.
   *
   * @return mixed[]
   *   Array of branch data with title, url, image, address, and city.
   */
  public function getBranchListData(): array {
    $storage = $this->entityTypeManager->getStorage('node');

    $query = $storage->getQuery()
      ->condition('type', 'branch')
      ->condition('status', NodeInterface::PUBLISHED)
      ->sort('field_promoted_on_lists', 'DESC')
      ->sort('title', 'ASC')
      ->accessCheck(TRUE);

    $nids = $query->execute();
    $nodes = $storage->loadMultiple($nids);

    $branches = [];
    foreach ($nodes as $node) {
      /** @var \Drupal\node\NodeInterface $node */
      $branch = [
        'title' => $node->label(),
        'url' => $node->toUrl()->toString(),
      ];

      $image_url = $this->getImageUrl($node);
      if ($image_url) {
        $branch['image'] = $image_url;
      }

      $address = $this->getAddress($node);
      if (!empty($address)) {
        $branch += $address;
      }

      $branches[] = $branch;
    }

    return $branches;
  }

  /**
   * Get image URL from a branch node's main media field.
   *
   * @param \Drupal\node\NodeInterface $node
   *   The branch node.
   *
   * @return string|null
   *   The image URL or NULL if not available.
   */
  private function getImageUrl(NodeInterface $node): ?string {
    if (!$node->hasField('field_main_media') || $node->get('field_main_media')->isEmpty()) {
      return NULL;
    }

    $media = $node->get('field_main_media')->referencedEntities()[0] ?? NULL;
    if (!($media instanceof MediaInterface) || !$media->hasField('field_media_image')) {
      return NULL;
    }

    $file = $media->get('field_media_image')->referencedEntities()[0] ?? NULL;
    if (!($file instanceof FileInterface)) {
      return NULL;
    }

    $file_uri = $file->getFileUri();
    if (empty($file_uri)) {
      return NULL;
    }

    $image_style = $this->entityTypeManager->getStorage('image_style')->load('list_teaser_4_3');

    return $image_style instanceof ImageStyleInterface
      ? $image_style->buildUrl($file_uri)
      : $this->fileUrlGenerator->generateAbsoluteString($file_uri);
  }

  /**
   * Get address data from a branch node.
   *
   * @param \Drupal\node\NodeInterface $node
   *   The branch node.
   *
   * @return array{address: string, city: string}|array{}
   *   Address and city, or empty array if not available.
   */
  private function getAddress(NodeInterface $node): array {
    if (!$node->hasField('field_address') || $node->get('field_address')->isEmpty()) {
      return [];
    }

    $address_item = $node->get('field_address')->first();
    if (!$address_item) {
      return [];
    }
    $address = $address_item->getValue();
    $postal_code = $address['postal_code'] ?? '';
    $locality = $address['locality'] ?? '';

    return [
      'address' => $address['address_line1'] ?? '',
      'city' => trim("$postal_code $locality"),
    ];
  }

}
