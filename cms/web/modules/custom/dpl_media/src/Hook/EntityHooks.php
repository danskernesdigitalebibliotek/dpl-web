<?php

declare(strict_types=1);

namespace Drupal\dpl_media\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\dpl_media\Entity\ImageMedia;
use Drupal\dpl_media\Entity\VideoMedia;
use Drupal\dpl_media\Entity\VideotoolMedia;
use Drupal\dpl_media\Entity\VideotoolVerticalMedia;

/**
 * Entity hooks.
 */
class EntityHooks {

  /**
   * Use custom bundle classes for media types.
   *
   * @todo Use attribute in Drupal 11.4.0.
   *
   * @param mixed[] $bundles
   *   Bundle info for altering.
   */
  #[Hook('entity_bundle_info_alter')]
  public function setMediaBundleClasses(array &$bundles): void {
    if (isset($bundles['media']['image'])) {
      $bundles['media']['image']['class'] = ImageMedia::class;
    }

    if (isset($bundles['media']['video'])) {
      $bundles['media']['video']['class'] = VideoMedia::class;
    }

    if (isset($bundles['media']['videotool'])) {
      $bundles['media']['videotool']['class'] = VideotoolMedia::class;
    }

    if (isset($bundles['media']['videotool_vertical'])) {
      $bundles['media']['videotool_vertical']['class'] = VideotoolVerticalMedia::class;
    }
  }

}
