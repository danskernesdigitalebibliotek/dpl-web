<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\Core\Entity\Attribute\Bundle;

/**
 * Bundle class for go_video_bundle_vertical_auto paragraphs.
 */
#[Bundle(
  entityType: 'paragraph',
  bundle: 'go_video_bundle_vertical_auto',
)]
class GoVideoBundleVerticalAutoParagraph extends GoVideoBundleAutomaticBase {
  // All shared with base class.
}
