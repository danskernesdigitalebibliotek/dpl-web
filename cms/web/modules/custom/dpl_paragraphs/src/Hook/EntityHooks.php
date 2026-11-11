<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Hook;

use Drupal\Core\Hook\Attribute\Hook;
use Drupal\dpl_paragraphs\Entity\GoLinkboxParagraph;
use Drupal\dpl_paragraphs\Entity\GoLinkParagraph;
use Drupal\dpl_paragraphs\Entity\GoMaterialSliderAutomaticParagraph;
use Drupal\dpl_paragraphs\Entity\GoMaterialSliderManualParagraph;
use Drupal\dpl_paragraphs\Entity\GoTextBodyParagraph;
use Drupal\dpl_paragraphs\Entity\GoVideoBundleAutomaticParagraph;
use Drupal\dpl_paragraphs\Entity\GoVideoBundleManualParagraph;
use Drupal\dpl_paragraphs\Entity\GoVideoBundleVerticalAutoParagraph;
use Drupal\dpl_paragraphs\Entity\GoVideoBundleVerticalManualParagraph;
use Drupal\dpl_paragraphs\Entity\GoVideoParagraph;
use Drupal\dpl_paragraphs\Entity\MaterialGridAutomaticParagraph;
use Drupal\dpl_paragraphs\Entity\MaterialGridManualParagraph;
use Drupal\dpl_paragraphs\Entity\NavSpotsManualParagraph;
use Drupal\dpl_paragraphs\Entity\RecommendationParagraph;
use Drupal\dpl_paragraphs\Entity\TextBodyParagraph;
use Drupal\dpl_paragraphs\Entity\VideoParagraph;

/**
 * Entity hooks for dpl_paragraphs module.
 */
class EntityHooks {

  /**
   * Use custom bundle classes for paragraph types.
   *
   * @todo Use attribute in Drupal 11.4.0.
   *
   * @param mixed[] $bundles
   *   Bundle info for altering.
   */
  #[Hook('entity_bundle_info_alter')]
  public function setParagraphBundleClasses(array &$bundles): void {
    $classes = [
      'text_body' => TextBodyParagraph::class,
      'go_text_body' => GoTextBodyParagraph::class,
      'video' => VideoParagraph::class,
      'go_video_bundle_manual' => GoVideoBundleManualParagraph::class,
      'go_video_bundle_vertical_manual' => GoVideoBundleVerticalManualParagraph::class,
      'go_video_bundle_automatic' => GoVideoBundleAutomaticParagraph::class,
      'go_video_bundle_vertical_auto' => GoVideoBundleVerticalAutoParagraph::class,
      'recommendation' => RecommendationParagraph::class,
      'nav_spots_manual' => NavSpotsManualParagraph::class,
      'go_material_slider_automatic' => GoMaterialSliderAutomaticParagraph::class,
      'go_material_slider_manual' => GoMaterialSliderManualParagraph::class,
      'material_grid_automatic' => MaterialGridAutomaticParagraph::class,
      'material_grid_manual' => MaterialGridManualParagraph::class,
      'go_video' => GoVideoParagraph::class,
      'go_linkbox' => GoLinkboxParagraph::class,
      'go_link' => GoLinkParagraph::class,
    ];

    foreach ($classes as $bundle => $class) {
      if (isset($bundles['paragraph'][$bundle])) {
        $bundles['paragraph'][$bundle]['class'] = $class;
      }
    }
  }

}
