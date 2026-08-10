<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\Core\Field\EntityReferenceFieldItemList;
use Drupal\dpl_media\Entity\ImageMedia;
use Drupal\file\Entity\File;
use Drupal\node\Entity\Node;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Bundle class for go_linkbox paragraphs.
 */
class GoLinkboxParagraph extends Paragraph {

  /**
   * Get the title.
   */
  public function getLinkboxTitle(): ?string {
    return $this->get('field_title')->value;
  }

  /**
   * Get the color.
   */
  public function getColor(): ?string {
    return $this->get('field_go_color')->value;
  }

  /**
   * Get the description.
   */
  public function getDescription(): ?string {
    return $this->get('field_go_description')->value;
  }

  /**
   * Get the linked local node.
   */
  public function getLinkedNode(): ?Node {
    if (!$this->hasField('field_go_link_paragraph') || $this->get('field_go_link_paragraph')->isEmpty()) {
      return NULL;
    }

    $linkParagraphs = $this->get('field_go_link_paragraph')->referencedEntities();
    $linkParagraph = $linkParagraphs[0] ?? NULL;

    return $linkParagraph instanceof GoLinkParagraph ? $linkParagraph->getNode() : NULL;
  }

  /**
   * Get the referenced image file.
   */
  public function getImageFile(): ?File {
    if ($this->hasField('field_go_image') && !$this->get('field_go_image')->isEmpty()) {
      $medias = $this->get('field_go_image');
      if ($medias instanceof EntityReferenceFieldItemList) {
        $media = $medias->referencedEntities()[0] ?? NULL;
        if ($media instanceof ImageMedia) {
          return $media->getImageFile();
        }
      }
    }

    return NULL;
  }

}
