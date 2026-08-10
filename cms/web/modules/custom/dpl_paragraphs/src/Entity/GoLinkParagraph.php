<?php

declare(strict_types=1);

namespace Drupal\dpl_paragraphs\Entity;

use Drupal\node\Entity\Node;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Bundle class for go_link paragraphs.
 */
class GoLinkParagraph extends Paragraph {

  /**
   * Get the link URI.
   */
  public function getUri(): ?string {
    if (!$this->get('field_go_link')->isEmpty()) {
      /** @var \Drupal\link\Plugin\Field\FieldType\LinkItem|null $link */
      $link = $this->get('field_go_link')->first();
      return $link?->uri;
    }
    return NULL;
  }

  /**
   * Get the linked local node.
   */
  public function getNode(): ?Node {
    if ($this->get('field_go_link')->isEmpty()) {
      return NULL;
    }

    try {
      /** @var \Drupal\link\Plugin\Field\FieldType\LinkItem|null $link */
      $link = $this->get('field_go_link')->first();
      $url = $link?->getUrl();
      if ($url && $url->isRouted() && $url->getRouteName() === 'entity.node.canonical') {
        $nid = $url->getRouteParameters()['node'] ?? NULL;
        if ($nid) {
          $node = Node::load($nid);
          if ($node instanceof Node) {
            return $node;
          }
        }
      }
    }
    catch (\Exception $e) {
      // Ignore invalid or unparseable URIs.
    }

    return NULL;
  }

}
