<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\paragraphs\Entity\Paragraph;

/**
 * Bundle class for text_body paragraphs.
 */
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
