<?php

namespace Drupal\dpl_react_apps\Services;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\file\FileInterface;
use Drupal\image\ImageStyleInterface;
use Drupal\media\MediaInterface;
use Drupal\address_dawa\AddressDawaItemInterface;
use Drupal\node\NodeInterface;

/**
 * Service for building branch list data for the React branch-list app.
 */
class BranchService {

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

      $coordinates = $this->getCoordinates($node);
      if (!empty($coordinates)) {
        $branch += $coordinates;
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
   * Tries field_address_dawa first (primary), then falls back to the
   * deprecated field_address for older branches.
   *
   * @param \Drupal\node\NodeInterface $node
   *   The branch node.
   *
   * @return array{address: string, city: string}|array{}
   *   Address and city, or empty array if not available.
   */
  private function getAddress(NodeInterface $node): array {
    // Try field_address_dawa first (primary address field).
    if ($node->hasField('field_address_dawa') && !$node->get('field_address_dawa')->isEmpty()) {
      $dawa_item = $node->get('field_address_dawa')->first();
      if ($dawa_item instanceof AddressDawaItemInterface) {
        $dawa_data = $dawa_item->getData()['adgangsadresse'] ?? NULL;
        if ($dawa_data) {
          $postal_city = trim(($dawa_data->postnummer->nr ?? '') . ' ' . ($dawa_data->postnummer->navn ?? ''));
          $text_value = $dawa_item->getTextValue();
          $address = $postal_city ? str_replace(" $postal_city", '', $text_value) : $text_value;

          return [
            'address' => $address,
            'city' => $postal_city,
          ];
        }
      }
    }

    // Fall back to deprecated field_address.
    if ($node->hasField('field_address') && !$node->get('field_address')->isEmpty()) {
      $address_item = $node->get('field_address')->first();
      if ($address_item) {
        $address = $address_item->getValue();
        $postal_code = $address['postal_code'] ?? '';
        $locality = $address['locality'] ?? '';

        return [
          'address' => $address['address_line1'] ?? '',
          'city' => trim("$postal_code $locality"),
        ];
      }
    }

    return [];
  }

  /**
   * Get GPS coordinates from a branch node's DAWA address field.
   *
   * @param \Drupal\node\NodeInterface $node
   *   The branch node.
   *
   * @return array{lat: string, lng: string}|array{}
   *   Lat/lng coordinates, or empty array if not available.
   */
  private function getCoordinates(NodeInterface $node): array {
    if (!$node->hasField('field_address_dawa') || $node->get('field_address_dawa')->isEmpty()) {
      return [];
    }

    $dawa_item = $node->get('field_address_dawa')->first();
    if (!($dawa_item instanceof AddressDawaItemInterface)) {
      return [];
    }

    $lat = $dawa_item->getLat();
    $lng = $dawa_item->getLng();

    if (empty($lat) || empty($lng)) {
      return [];
    }

    return [
      'lat' => $lat,
      'lng' => $lng,
    ];
  }

}