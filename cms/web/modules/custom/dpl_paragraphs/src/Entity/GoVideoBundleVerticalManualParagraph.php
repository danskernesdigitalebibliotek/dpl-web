<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\Core\Entity\Attribute\Bundle;

/**
 * Bundle class for go_video_bundle_vertical_manual paragraphs.
 */
#[Bundle(
  entityType: 'paragraph',
  bundle: 'go_video_bundle_vertical_manual',
)]
class GoVideoBundleVerticalManualParagraph extends GoVideoBundleManualBase {
  // All shared with base class.
}
