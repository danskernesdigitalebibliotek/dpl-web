<?php

declare(strict_types=1);

namespace Drupal\dpl_media\Entity;

use Drupal\Core\Field\EntityReferenceFieldItemList;
use Drupal\file\Entity\File;
use Drupal\media\Entity\Media;

/**
 * Bundle class for image media.
 */
class ImageMedia extends Media {

  /**
   * Get the referenced image file.
   */
  public function getImageFile(): ?File {
    if ($this->hasField('field_media_image') && !$this->get('field_media_image')->isEmpty()) {
      $files = $this->get('field_media_image');
      if ($files instanceof EntityReferenceFieldItemList) {
        $file = $files->referencedEntities()[0] ?? NULL;
        if ($file instanceof File) {
          return $file;
        }
      }
    }
    return NULL;
  }

}
