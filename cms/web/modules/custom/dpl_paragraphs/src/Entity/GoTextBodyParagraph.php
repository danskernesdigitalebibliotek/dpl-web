<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\Core\Entity\Attribute\Bundle;

/**
 * Bundle class for go_text_body paragraphs.
 *
 * It has the same body field as text_body, and the apps show it the same way.
 */
#[Bundle(
  entityType: 'paragraph',
  bundle: 'go_text_body',
)]
class GoTextBodyParagraph extends TextBodyParagraph {

}
