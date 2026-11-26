<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\Core\Entity\Attribute\Bundle;

/**
 * Bundle class for go_video_bundle_automatic paragraphs.
 */
#[Bundle(
  entityType: 'paragraph',
  bundle: 'go_video_bundle_automatic',
)]
class GoVideoBundleAutomaticParagraph extends GoVideoBundleAutomaticBase {
  // All shared with base class.
}
