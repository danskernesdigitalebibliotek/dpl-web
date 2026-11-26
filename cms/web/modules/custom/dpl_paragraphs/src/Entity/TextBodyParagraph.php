<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\Core\Entity\Attribute\Bundle;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Bundle class for text_body paragraphs.
 */
#[Bundle(
  entityType: 'paragraph',
  bundle: 'text_body',
)]
class TextBodyParagraph extends Paragraph {

  /**
   * Get the processed body text.
   */
  public function getBody(): string {
    /** @var \Drupal\text\Plugin\Field\FieldType\TextLongItem $body */
    $body = $this->get('field_body');

    return (string) $body->processed;
  }

}
