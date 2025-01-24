<?php

namespace Drupal\media_videotool\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\Attribute\FieldFormatter;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\media\Entity\MediaType;
use Drupal\media_videotool\Plugin\media\Source\VideoTool;

/**
 * Plugin implementation of the 'VideoTool embed' formatter.
 */
#[FieldFormatter(
  id: 'media_videotool_embed',
  label: new TranslatableMarkup('VideoTool embed'),
  field_types: [
    'string',
  ],
)]
class VideoToolFormatter extends FormatterBase {

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $element = [];

    /** @var \Drupal\media\MediaInterface $media */
    $media = $items->getEntity();
    $videotool = $media->getSource();
    foreach ($items as $delta => $item) {
      $url = $videotool->getMetadata($media, VideoTool::METADATA_ATTRIBUTE_URL);
      if ($url) {
        $element[$delta] = [
          '#type' => 'html_tag',
          '#tag' => 'iframe',
          '#attributes' => [
            'src' => '',
            'data-consent-src' => $url,
            'frameborder' => 0,
            'allowtransparency' => TRUE,
            'height' => '100%',
            'width' => '100%',
            'data-category-consent' => 'cookie_cat_marketing',
            'data-once' => 'cookieinformation-iframe',
          ],
        ];
      }
      else {
        $element[$delta] = [
          '#markup' => $item->value,
        ];
      }
    }

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public static function isApplicable(FieldDefinitionInterface $field_definition): bool {
    if ($field_definition->getTargetEntityTypeId() !== 'media') {
      return FALSE;
    }

    if (parent::isApplicable($field_definition)) {
      $media_type = $field_definition->getTargetBundle();

      if ($media_type) {
        $media_type = MediaType::load($media_type);
        return $media_type && $media_type->getSource() instanceof VideoTool;
      }
    }
    return FALSE;
  }

}
