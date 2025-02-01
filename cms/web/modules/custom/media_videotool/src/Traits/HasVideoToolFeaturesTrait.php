<?php

namespace Drupal\media_videotool\Traits;

use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\media\Entity\MediaType;
use Drupal\media_videotool\Plugin\media\Source\VideoTool;

use function Safe\preg_match;

/**
 * Trait used for common VideoTool methods.
 */
trait HasVideoToolFeaturesTrait {

  /**
   * Function for checking if a URL match the VideoTool URL format.
   */
  protected static function isValidVideoToolUrl(string $url): bool {
    return (bool) preg_match('/^https:\/\/media\.videotool\.dk\/\?vn=\d+_\d+$/', $url);
  }

  /**
   * Function for checking if a specific entity is of the VideoTool type..
   */
  protected static function targetEntityIsVideoTool(FieldDefinitionInterface $fieldDefinition, callable $isApplicable): bool {
    if ($fieldDefinition->getTargetEntityTypeId() !== 'media') {
      return FALSE;
    }

    if ($isApplicable($fieldDefinition)) {
      $media_type = $fieldDefinition->getTargetBundle();

      if ($media_type) {
        $media_type = MediaType::load($media_type);
        return $media_type && $media_type->getSource() instanceof VideoTool;
      }
    }
    return FALSE;
  }

}
